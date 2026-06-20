import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FloatingFood from './FloatingFood';

import '../../styles/about.css';

const AboutSection = () => {
  return (
    <section className="about onboarding-section--flexible" id="about-us">
      <FloatingFood
        className="floating-food--behind"
        items={[
          {
            src: '/images/decorations/tempura.png',
            position: 'left',
            top: '250px',
            size: 'lg',
            rotate: '15deg',
            opacity: 0.12,
          },
        ]}
      />
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
            width={600}
            height={450}
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
            <div className="btn-wiggle-wrapper">
              <Link to="/about" className="btn-wiggle">
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default AboutSection;
