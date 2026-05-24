import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollHint from './ScrollHint';
import '../../styles/contact.css';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Via Example 123, 95100 Catania CT',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+39 095 123 4567',
    href: 'tel:+390951234567',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@kyotosushi.it',
    href: 'mailto:info@kyotosushi.it',
  },
];

const hours = [
  { days: 'Mon - Fri', times: '12:00 - 15:00 / 19:00 - 23:00' },
  { days: 'Sat - Sun', times: '12:00 - 23:30' },
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
                  {item.href ? (
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.123456789!2d15.0874!3d37.5079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDMwJzI4LjQiTiAxNcKwMDUnMTAuNiJF!5e0!3m2!1sit!2sit!4v1"
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
      <ScrollHint targetId="footer" text="More info" />
    </section>
  );
};

export default ContactSection;
