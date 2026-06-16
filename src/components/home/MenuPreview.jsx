import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollection } from '../../hooks/useFirestore';
import { ArrowRight, Star, AlertCircle, Info } from 'lucide-react';
import AllergenModal from '../common/AllergenModal';
import { fallbackData } from '../../data/fallbackData';

import '../../styles/menu.css';

// Reusable Image component with loading shimmer
function ImageWithLoader({ src, alt, className, ...props }) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {imageLoading && <div className="menu-image-shimmer skeleton-shimmer"></div>}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
        style={{ opacity: imageLoading ? 0 : 1 }}
        {...props}
      />
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

function FeaturedCard({ item }) {
  const hasMedia = !!item.imageUrl;
  const isVideo = hasMedia && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "");
  const hasCardBody = !!item.name || (item.price !== undefined && item.price !== "") || !!item.description;

  const sizeClass = `card-size--${item.cardSize || "long"}`;
  const bodyClass = hasCardBody ? "has-card-body" : "is-full-image";

  return (
    <motion.div variants={cardVariants} className={`featured-card-grid-item ${sizeClass}`}>
      <Link
        to={item.link || "/menu"}
        className={`menu-flip-card menu-featured-card ${sizeClass}`}
      >
        <div className="menu-flip-card__inner">
          <div className="menu-flip-card__face menu-flip-card__front">
            <div className={`menu-section__card-image-wrapper ${bodyClass}`}>
              {hasMedia ? (
                isVideo ? (
                  <video
                    src={item.imageUrl}
                    className="menu-section__card-image"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                ) : (
                  <ImageWithLoader
                    src={item.imageUrl}
                    alt={item.name || "Featured Item"}
                    className="menu-section__card-image"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="menu-section__card-image-placeholder">
                  <img src="/images/logo-white.avif" alt="" className="placeholder-logo" />
                </div>
              )}
              <div className="menu-card-hint-badge">
                <Info size={12} />
                <span>Info</span>
              </div>
              {item.isBestSeller && (
                <span className="menu-modal-badge">Best Seller</span>
              )}
              {item.hasPhotoDisclaimer && (
                <div className="menu-card-photo-disclaimer">
                  Photo may not exactly represent the actual dish
                </div>
              )}
            </div>
            
            {hasCardBody && (
              <div className="menu-section__card-body">
                {item.cardSize === "long" || item.cardSize === "medium" ? (
                  // Wide horizontal card body layout
                  <>
                    <div className="menu-featured-row-header">
                      {item.name && <h3 className="menu-section__card-name">{item.name}</h3>}
                      {item.price && (
                        <span className="menu-section__card-price menu-section__card-price--red">
                          €{Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.description && <p className="menu-section__card-description">{item.description}</p>}
                  </>
                ) : (
                  // Standard vertical card body layout
                  <>
                    {item.name && <h3 className="menu-section__card-name">{item.name}</h3>}
                    {item.description && <p className="menu-section__card-description">{item.description}</p>}
                    {item.price && (
                      <div className="menu-section__card-footer" style={{ marginTop: "auto" }}>
                        <span className="menu-section__card-price">€{Number(item.price).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const MenuPreview = () => {
  const { data: firebaseFeatured = [] } = useCollection('featuredItems', {
    orderByField: 'order',
    realtime: true
  });

  const [isMobile, setIsMobile] = useState(false);
  const [showAllergens, setShowAllergens] = useState(false);



  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayItems = useMemo(() => {
    const items = firebaseFeatured && firebaseFeatured.length > 0
      ? firebaseFeatured.filter(item => item.active !== false)
      : (fallbackData?.featuredItems || []).filter(item => item.active !== false);
    return items.slice(0, 8);
  }, [firebaseFeatured]);

  return (
    <section className="menu-section onboarding-section--flexible" id="menu-preview">
      <div className="menu-section__container" style={{ display: 'block' }}>
        <motion.div
          className="menu-section__logo-lockup"
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img
            src="/images/logo-white.avif"
            alt="Kyō-To"
            className="menu-section__logo"
          />
        </motion.div>

        <motion.div
          className="menu-section__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="menu-section__title">Our Menu</h2>
          <p className="menu-section__subtitle">
            Discover the authentic flavors of Japanese cuisine
          </p>
          <hr className="menu-section__divider" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key="homepage-featured"
            className="menu-section__content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {isMobile ? (
              <div className="menu-section__grid-4">
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--color-brand-gold)', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Star size={16} fill="currentColor" /> Featured Menu
                  </span>
                </div>
                {displayItems.map((item) => (
                  <FeaturedCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              <div className="menu-section__grid-3" style={{ gridAutoFlow: 'dense' }}>
                {displayItems.map((item) => (
                  <FeaturedCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="menu-section__view-all"
          style={{ paddingBottom: isMobile ? '80px' : '0', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/menu" className="menu-section__view-all-btn">
            View Full Menu
            <ArrowRight size={16} />
          </Link>
          <button 
            onClick={() => setShowAllergens(true)}
            className="menu-section__view-all-btn menu-allergens-preview-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <AlertCircle size={16} />
            Allergeni
          </button>
        </motion.div>

      </div>
      <AllergenModal isOpen={showAllergens} onClose={() => setShowAllergens(false)} />
    </section>
  );
};

export default MenuPreview;
