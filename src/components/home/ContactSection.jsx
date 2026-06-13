import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import '../../styles/contact.css';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Via Barone della Bicocca, 14, 95124 Catania CT',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <a href="tel:+390952907347">095 290 7347</a>
        <a href="tel:+393475092264">+39 347 509 2264</a>
      </span>
    ),
    isCustom: true,
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'reserve@kyotosushicatania.com',
    href: 'mailto:reserve@kyotosushicatania.com',
  },
];

const hours = [
  { days: 'Monday', times: '18:00 - 23:30' },
  { days: 'Tue - Sun', times: '12:30 - 15:00 / 18:00 - 23:30' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const ContactSection = () => {
  return (
    <section className="contact onboarding-section--flexible" id="contact-us">
      <div className="contact__header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="contact__title">Come Visit Us</h2>
          <p className="contact__subtitle">We look forward to welcoming you in Catania</p>
          <hr className="contact__divider" />
        </motion.div>
      </div>

      <div className="contact__container">
        <motion.div
          className="contact__info"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <div className="contact__block">
            <h3 className="contact__block-title">Contact</h3>
            {contactInfo.map((item) => (
              <div key={item.label} className="contact__item">
                <div className="contact__item-icon">
                  <item.icon size={18} />
                </div>
                <div className="contact__item-text">
                  {item.isCustom ? (
                    item.value
                  ) : item.href ? (
                    <a href={item.href}>{item.value}</a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="contact__block">
            <h3 className="contact__block-title">Opening Hours</h3>
            <ul className="contact__hours-list">
              {hours.map((h) => (
                <li key={h.days} className="contact__hours-item">
                  <span className="contact__hours-day">{h.days}</span>
                  <span className="contact__hours-time">{h.times}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="contact__map"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <iframe
            title="Kyō-To Sushi Catania - Location"
            src="https://maps.google.com/maps?q=Via%20Barone%20della%20Bicocca,%2014,%20Catania&t=&z=17&ie=UTF8&iwloc=&output=embed"
            className="contact__map-frame"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>

      <motion.div
        className="contact__cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link to="/contact" className="contact__cta-btn">
          Reserve Your Table
        </Link>
      </motion.div>

    </section>
  );
};

export default ContactSection;
