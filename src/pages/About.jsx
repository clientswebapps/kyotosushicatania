import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import "../styles/about.css";

export default function About() {
  return (
    <div className="about-page">
      <Helmet>
        <title>About Us - Kyō-To Sushi Catania</title>
        <meta name="description" content="Discover the story and philosophy behind Kyō-To Sushi Catania. We blend traditional Japanese Washoku art with contemporary culinary innovation." />
        <meta property="og:title" content="About Us - Kyō-To Sushi Catania" />
        <meta property="og:description" content="Discover the story and philosophy behind Kyō-To Sushi Catania. Traditional Japanese Washoku art with contemporary innovation." />
        <meta property="og:url" content="https://kyotosushicatania.web.app/about" />
      </Helmet>
      <div className="about-page-header">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About Us
        </motion.h1>
        <div className="section-divider"></div>
      </div>

      <div className="about-page-content">
        <motion.div
          className="about-story-block"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="about-story-image">
            <img src="/images/sashimi-platter.avif" alt="Our restaurant" />
          </div>
          <div className="about-story-text">
            <span className="about-label">OUR STORY</span>
            <h2>Tradition and Innovation</h2>
            <p>
              Kyō-To Sushi Catania was born from a passion for authentic Japanese
              cuisine and the desire to bring a unique culinary experience to the
              heart of Sicily. Our name evokes Kyoto, the ancient capital of Japan,
              guardian of age-old traditions.
            </p>
            <p>
              Every dish we serve is the result of a perfect balance between
              tradition and contemporary creativity. We use only the finest
              ingredients, carefully selected by our chef to ensure authentic
              freshness and flavor.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="about-story-block reverse"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="about-story-image">
            <img src="/images/dragon-roll.avif" alt="Our dishes" />
          </div>
          <div className="about-story-text">
            <span className="about-label">OUR PHILOSOPHY</span>
            <h2>The Art of Washoku</h2>
            <p>
              Washoku — traditional Japanese cuisine — is much more than a
              simple way of cooking. It is an art that celebrates the harmony of
              flavors, colors, and textures, respecting the seasonality of
              ingredients.
            </p>
            <p>
              In our restaurant, every composition is designed to delight the
              eyes before the palate. From the minimalist elegance of sashimi to
              the richness of our creative rolls, every dish tells a story.
            </p>
            <p className="about-japanese-text">和食の心</p>
            <p className="about-japanese-subtitle">
              Washoku no Kokoro — The Heart of Japanese Cuisine
            </p>
          </div>
        </motion.div>

        <motion.div
          className="about-values"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Our Values</h2>
          <div className="section-divider"></div>
          <div className="about-values-grid">
            <div className="about-value-card" style={{ borderTopColor: 'var(--color-brand-blue)' }}>
              <span className="about-value-icon" style={{ textShadow: '0 0 15px var(--color-brand-blue-glow)' }}>🐟</span>
              <h3>Freshness</h3>
              <p>
                Ingredients selected daily to ensure the utmost freshness in
                every dish.
              </p>
            </div>
            <div className="about-value-card" style={{ borderTopColor: 'var(--color-brand-red)' }}>
              <span className="about-value-icon" style={{ textShadow: '0 0 15px var(--color-brand-red-glow)' }}>🎯</span>
              <h3>Precision</h3>
              <p>
                Every cut, every presentation, every detail is crafted with
                artisanal precision.
              </p>
            </div>
            <div className="about-value-card" style={{ borderTopColor: 'var(--color-brand-gold)' }}>
              <span className="about-value-icon" style={{ textShadow: '0 0 15px var(--color-brand-gold-glow)' }}>🌸</span>
              <h3>Harmony</h3>
              <p>
                The balance between flavors, colors, and textures is at the core
                of our cuisine.
              </p>
            </div>
            <div className="about-value-card" style={{ borderTopColor: 'var(--color-brand-blue)' }}>
              <span className="about-value-icon" style={{ textShadow: '0 0 15px var(--color-brand-blue-glow)' }}>💫</span>
              <h3>Innovation</h3>
              <p>
                We respect tradition but embrace creativity to offer new
                experiences.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
