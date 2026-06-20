import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import '../../styles/navbar.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isSolid = true;

  return (
    <>
      {/* Backdrop overlay to dim the content behind when mobile menu is open */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className={`navbar-wrapper ${mobileOpen ? 'is-open' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <nav className={`navbar ${mobileOpen ? 'is-open' : ''} ${scrolled ? 'scrolled' : ''}`}>
          <div className="navbar__header-row">
            <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
              <img
                src="/images/logo.avif"
                alt="Kyō-To Sushi Catania"
              />
            </Link>

            <ul className="navbar__links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={isActive(link.path) ? 'active' : ''}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="navbar__reserve">
              <Link to="/contact" className="navbar__reserve-btn">
                Reserve
              </Link>
            </div>

            <button
              className={`navbar__hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          {/* Mobile Dropdown Panel */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                className="navbar__mobile-dropdown"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ul className="navbar__mobile-nav">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={isActive(link.path) ? 'active' : ''}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="navbar__mobile-footer">
                  <Link
                    to="/contact"
                    className="navbar__reserve-btn navbar__reserve-btn--mobile"
                    onClick={() => setMobileOpen(false)}
                  >
                    Reserve a Table
                  </Link>
                  
                  <div className="navbar__mobile-socials">
                    <a
                      href="https://www.instagram.com/kyoto_asian_cuisine/?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__mobile-social-icon"
                      aria-label="Instagram"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/kyotocatania/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__mobile-social-icon"
                      aria-label="Facebook"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
