import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import '../../styles/about.css';

const AboutSection = () => {
  return (
    <section className="about onboarding-section--flexible" id="about-us">
      <div className="about__container">
        <motion.div
          className="about__image-wrapper"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <img
            src="/images/1.jpeg"
            alt="Kyō-To restaurant atmosphere"
            className="about__image"
            loading="lazy"
          />
        </motion.div>

        <motion.div
          className="about__content"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <span className="about__label">OUR STORY</span>

          <h2 className="about__title">Tradition and Innovation</h2>
          <hr className="about__divider" />

          <p className="about__text">
            In the heart of Catania, Kyō-To brings the essence of contemporary
            Japanese cuisine. Every dish is a sensory journey that blends ancient
            tradition with modern creativity, using only the finest quality
            ingredients.
          </p>

          <p className="about__text">
            Our chef creates compositions that delight the eyes before the palate,
            honoring the art of washoku — the harmony of flavors,
            colors, and textures.
          </p>

          <span className="about__japanese">和食の心</span>

          <div className="about__stats">
            <div className="about__stat">
              <span className="about__stat-number">100%</span>
              <span className="about__stat-label">Fresh</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">25+</span>
              <span className="about__stat-label">Specialties</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">4.9★</span>
              <span className="about__stat-label">Reviews</span>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Link to="/about" className="bestsellers__badge" style={{ position: 'static', display: 'inline-block', textDecoration: 'none', background: 'var(--color-brand-gold)', color: 'var(--color-bg)', padding: '12px 28px', borderRadius: '4px', fontWeight: 600, letterSpacing: '1px' }}>
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default AboutSection;
