import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { generateRoundWavyPath } from '../../utils/wavyPath';
import '../../styles/footer.css';

const quickLinks = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      {/* Top wiggly rounded cutout */}
      <div className="footer__wave-cutout" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d={generateRoundWavyPath()} fill="#0d0d0d" />
        </svg>
      </div>

      <div className="footer__container">
        <div className="footer__brand">
          <Link to="/">
            <img
              src="/images/logo-white.avif"
              alt="Kyō-To Sushi Catania"
              className="footer__logo"
              width={180}
              height={72}
            />
          </Link>
          <p className="footer__tagline">Japanese Asian Contemporary Cuisine</p>
          <p className="footer__description">
            In the heart of Catania, a culinary journey between Japanese tradition and contemporary
            innovation. Every dish tells a story of passion and quality.
          </p>
        </div>

        <div className="footer__links">
          <h4 className="footer__links-title">Quick Links</h4>
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer__social-hours">
          <div>
            <h4 className="footer__social-title">Follow Us</h4>
            <div className="footer__social-icons">
              <a
                href="https://www.instagram.com/kyoto_asian_cuisine/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-icon"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/kyotocatania/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-icon"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer__hours-title">Opening Hours</h4>
            <ul className="footer__hours-list">
              <li className="footer__hours-item">
                <span>Monday</span>
                <span>18:00 - 23:30</span>
              </li>
              <li className="footer__hours-item">
                <span>Tue - Sun</span>
                <span>12:30 - 15:00 / 18:00 - 23:30</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; 2026 Kyō-To Sushi Catania. All rights reserved.
        </p>
        <div className="footer__bottom-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
