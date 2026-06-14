import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, Send, Users, Calendar } from "lucide-react";
import { useAddDocument } from "../hooks/useFirestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/contact.css";

const validateReservationTime = (dateStr, timeStr) => {
  const selectedDate = new Date(dateStr);
  const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Convert selected time "HH:MM" to a value we can compare (e.g. 18.5 for 18:30)
  const [hours, minutes] = timeStr.split(":").map(Number);
  const timeVal = hours + minutes / 60;
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate < today) {
    return "The selected date is in the past. Please select a valid date.";
  }
  
  if (targetDate.getTime() === today.getTime()) {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const nowTimeVal = nowHours + nowMinutes / 60;
    if (timeVal <= nowTimeVal + 0.5) { // Must be at least 30 minutes in advance
      return "For same-day reservations, please book at least 30 minutes in advance, or call the restaurant directly.";
    }
  }

  // Monday Opening Hours: 18:00 - 23:30 (18.0 to 23.5)
  if (dayOfWeek === 1) {
    if (timeVal < 18.0 || timeVal > 23.5) {
      return "On Mondays, Kyō-To is only open for dinner from 18:00 to 23:30.";
    }
  } else {
    // Tue - Sun Opening Hours: 12:30 - 15:00 (12.5 to 15.0) AND 18:00 - 23:30 (18.0 to 23.5)
    const isLunch = timeVal >= 12.5 && timeVal <= 15.0;
    const isDinner = timeVal >= 18.0 && timeVal <= 23.5;
    if (!isLunch && !isDinner) {
      return "Kyō-To is open Tue-Sun for lunch (12:30 - 15:00) and dinner (18:00 - 23:30). Please select a time within these slots.";
    }
  }
  return null;
};

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const getTimeSlots = (dateStr) => {
  if (!dateStr) return [];
  const selectedDate = new Date(dateStr);
  const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  const lunchSlots = ["12:30", "13:00", "13:30", "14:00", "14:30"];
  const dinnerSlots = [
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00"
  ];
  
  let slots = [];
  if (dayOfWeek === 1) {
    slots = [...dinnerSlots];
  } else {
    slots = [...lunchSlots, ...dinnerSlots];
  }
  
  // Filter out past slots for same-day bookings
  const todayStr = formatDateString(new Date());
  if (dateStr === todayStr) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const nowTimeVal = currentHours + currentMinutes / 60;
    
    slots = slots.filter(slot => {
      const [h, m] = slot.split(":").map(Number);
      const slotTimeVal = h + m / 60;
      return slotTimeVal > nowTimeVal + 0.5; // at least 30 min in advance
    });
  }
  return slots;
};

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let startDay = firstDay.getDay();
  // Adjust so Monday is index 0 and Sunday is index 6
  startDay = startDay === 0 ? 6 : startDay - 1;
  
  const totalDays = lastDay.getDate();
  const days = [];
  
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

export default function Contact() {
  const { addDocument, loading: submitting } = useAddDocument("reservations");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    partySize: 2,
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (date) => {
    setFormData(prev => ({
      ...prev,
      date: formatDateString(date),
      time: ""
    }));
    setShowCalendar(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || submitting) return;
    setIsSubmitting(true);
    setError(null);

    // 1. Time-slot validation
    const timeValidationError = validateReservationTime(formData.date, formData.time);
    if (timeValidationError) {
      setError(timeValidationError);
      setIsSubmitting(false);
      return;
    }

    // 2. Duplicate Booking Prevention
    const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, "reservations"),
          where("date", "==", formData.date),
          where("time", "==", formData.time)
        );
        const querySnapshot = await getDocs(q);
        const isDuplicate = querySnapshot.docs.some(doc => {
          const data = doc.data();
          return (
            data.email?.toLowerCase() === formData.email.toLowerCase() ||
            data.phone === formData.phone
          );
        });

        if (isDuplicate) {
          setError("A reservation request with this email or phone number already exists for this date and time.");
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Error checking for duplicate reservations:", err);
      }
    }

    try {
      await addDocument({
        ...formData,
        partySize: Number(formData.partySize),
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        partySize: 2,
        notes: "",
      });
    } catch (err) {
      setError("An error occurred. Please try again or call us directly.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact & Reservations - Kyō-To Sushi Catania</title>
        <meta name="description" content="Reserve your table at Kyō-To Sushi Catania. Find our location, opening hours, and contact information. Experience the best Japanese cuisine in Catania." />
        <meta property="og:title" content="Contact & Reservations - Kyō-To Sushi Catania" />
        <meta property="og:description" content="Reserve your table at Kyō-To Sushi Catania. Experience the best Japanese cuisine in Catania." />
        <meta property="og:url" content="https://www.kyotosushicatania.com/contact" />
      </Helmet>
      <div className="contact-page-header">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Contact & Reservations
        </motion.h1>
        <div className="section-divider"></div>
        <p className="section-subtitle">
          Reserve your table or come visit us in Catania
        </p>
      </div>

      <div className="contact-page-content">
        <motion.div
          className="contact-info-full"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="contact-info-cards">
            <div className="contact-info-card">
              <MapPin size={24} className="contact-icon" />
              <div>
                <h3>Address</h3>
                <p>Via Barone della Bicocca, 14</p>
                <p>95124 Catania CT, Italy</p>
              </div>
            </div>
            <div className="contact-info-card">
              <Phone size={24} className="contact-icon" />
              <div>
                <h3>Phone</h3>
                <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <a href="tel:+390952907347">095 290 7347</a>
                  <a href="tel:+393475092264">+39 347 509 2264</a>
                </p>
              </div>
            </div>
            <div className="contact-info-card">
              <Mail size={24} className="contact-icon" />
              <div>
                <h3>Email</h3>
                <p>
                  <a href="mailto:reserve@kyotosushicatania.com">reserve@kyotosushicatania.com</a>
                </p>
              </div>
            </div>
            <div className="contact-info-card">
              <Clock size={24} className="contact-icon" />
              <div>
                <h3>Hours</h3>
                <p>Monday: 18:00 - 23:30</p>
                <p>Tue - Sun: 12:30 - 15:00 / 18:00 - 23:30</p>
              </div>
            </div>
          </div>

          <div className="contact-map-full">
            <iframe
              src="https://maps.google.com/maps?q=Via%20Barone%20della%20Bicocca,%2014,%20Catania&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: "16px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kyō-To Sushi Catania Location"
            ></iframe>
          </div>
        </motion.div>

        <motion.div
          className="contact-reservation-form"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Reserve Your Table</h2>
          <p className="reservation-subtitle">
            Fill out the form and we will confirm your reservation
          </p>

          {submitted ? (
            <motion.div
              className="reservation-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="reservation-success-icon">✓</span>
              <h3>Reservation Received!</h3>
              <p>
                We will confirm via email or phone. Thank you for choosing
                Kyō-To!
              </p>
              <button
                className="btn btn-gold-outline"
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '24px' }}
              >
                New Reservation
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="reservation-form">
              <div className="form-group">
                <label htmlFor="res-name">Full Name</label>
                <input
                  id="res-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="res-email">Email</label>
                  <input
                    id="res-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="res-phone">Phone</label>
                  <input
                    id="res-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+39 ..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ position: "relative" }}>
                  <label>
                    <Calendar size={14} /> Date
                  </label>
                  <button
                    type="button"
                    className="custom-datepicker-trigger"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span>{formData.date ? formatDateLabel(formData.date) : "Select a date..."}</span>
                  </button>
                  
                  {showCalendar && (
                    <div className="calendar-popover">
                      <div className="calendar-popover-header">
                        <button type="button" className="cal-nav-btn" onClick={handlePrevMonth}>&larr;</button>
                        <span className="cal-current-month">
                          {currentMonth.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
                        </span>
                        <button type="button" className="cal-nav-btn" onClick={handleNextMonth}>&rarr;</button>
                      </div>
                      <div className="calendar-popover-weekdays">
                        {["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"].map(d => (
                          <span key={d} className="cal-weekday">{d}</span>
                        ))}
                      </div>
                      <div className="calendar-popover-days">
                        {getDaysInMonth(currentMonth).map((day, idx) => {
                          if (!day) return <span key={`empty-${idx}`} className="cal-day empty"></span>;
                          
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const isPast = day < today;
                          const isSelected = formData.date === formatDateString(day);
                          const isToday = formatDateString(day) === formatDateString(new Date());
                          
                          return (
                            <button
                              key={day.getTime()}
                              type="button"
                              disabled={isPast}
                              className={`cal-day-btn ${isPast ? "past" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                              onClick={() => handleSelectDate(day)}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="res-time">
                    <Clock size={14} /> Time
                  </label>
                  <select
                    id="res-time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    disabled={!formData.date}
                  >
                    <option value="">Select a time...</option>
                    {formData.date && getTimeSlots(formData.date).map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="res-party">
                  <Users size={14} /> Number of Guests
                </label>
                <select
                  id="res-party"
                  name="partySize"
                  value={formData.partySize}
                  onChange={handleChange}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                    <option value="11">More than 10 (specify in notes)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="res-notes">Note</label>
                <textarea
                  id="res-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Allergies, special occasions, requests..."
                  rows={3}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button
                type="submit"
                className="reservation-submit-btn"
                disabled={isSubmitting || submitting}
              >
                <Send size={18} />
                <span>{isSubmitting || submitting ? "Submitting..." : "Submit Reservation"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
