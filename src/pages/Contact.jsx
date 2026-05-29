import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Mail, Send, Users, Calendar } from "lucide-react";
import { useAddDocument } from "../hooks/useFirestore";
import "../styles/contact.css";

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
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await addDocument({
        ...formData,
        partySize: Number(formData.partySize),
        status: "pending",
        createdAt: new Date(),
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
                  <a href="mailto:info@kyotosushi.it">info@kyotosushi.it</a>
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
                <div className="form-group">
                  <label htmlFor="res-date">
                    <Calendar size={14} /> Date
                  </label>
                  <input
                    id="res-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="res-time">
                    <Clock size={14} /> Time
                  </label>
                  <input
                    id="res-time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
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
                disabled={submitting}
              >
                <Send size={18} />
                <span>{submitting ? "Submitting..." : "Submit Reservation"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
