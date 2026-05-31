import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollection } from '../../hooks/useFirestore';
import { ArrowRight, Star, AlertCircle, Info } from 'lucide-react';
import AllergenModal from '../common/AllergenModal';

import '../../styles/menu.css';

const imageMap = {
  'Dragon Roll': '/images/dragon-roll.avif',
  'Premium Mixed Sashimi': '/images/sashimi-platter.avif',
  'Tonkotsu Ramen': '/images/tonkotsu-ramen.avif',
  'Rainbow Roll': '/images/rainbow-roll.avif',
  'Mixed Tempura': '/images/tempura-platter.avif',
  'Grilled Gyoza': '/images/gyoza.avif',
};

const itemHighlights = {
  'Dragon Roll': ['🔥 Chef\'s Pick', '🥑 Fresh Avocado'],
  'Premium Mixed Sashimi': ['🌊 Wild-caught', '✨ Premium Quality'],
  'Tonkotsu Ramen': ['⏳ 18hr broth', '🥚 Marinated Egg'],
  'Rainbow Roll': ['🌈 4 Fish Types', '🔥 Top Seller'],
  'Mixed Tempura': ['🍤 Crispy', '🌱 Seasonal Veg'],
  'Grilled Gyoza': ['🥟 Hand-made', '🔥 Grilled to order']
};

const fallbackCategories = [
  { id: 'sushi-rolls', name: 'Sushi Rolls', nameIt: 'Sushi Rolls', icon: '🍣', order: 1 },
  { id: 'sashimi', name: 'Sashimi', nameIt: 'Sashimi', icon: '🐟', order: 2 },
  { id: 'ramen', name: 'Ramen & Noodles', nameIt: 'Ramen & Noodles', icon: '🍜', order: 4 },
  { id: 'antipasti', name: 'Starters', nameIt: 'Starters', icon: '🥗', order: 6 },
];

const fallbackItems = [
  { id: '1', name: 'Dragon Roll', description: 'Shrimp tempura, avocado, tobiko, and unagi sauce', price: 14.9, categoryId: 'sushi-rolls', imageUrl: '/images/dragon-roll.avif', isBestSeller: true },
  { id: '4', name: 'Rainbow Roll', description: 'California roll topped with salmon, tuna, avocado, and shrimp', price: 16.5, categoryId: 'sushi-rolls', imageUrl: '/images/rainbow-roll.avif', isBestSeller: true },
  { id: '2', name: 'Premium Mixed Sashimi', description: '15-piece selection: salmon, tuna, sea bass, red shrimp, and yellowtail', price: 22.9, categoryId: 'sashimi', imageUrl: '/images/sashimi-platter.avif', isBestSeller: true },
  { id: '3', name: 'Tonkotsu Ramen', description: '18-hour pork broth, chashu, marinated egg, nori, and scallion', price: 16.9, categoryId: 'ramen', imageUrl: '/images/tonkotsu-ramen.avif', isBestSeller: true },
  { id: '5', name: 'Mixed Tempura', description: 'Shrimp and seasonal vegetables in light, crispy batter', price: 13.9, categoryId: 'tempura', imageUrl: '/images/tempura-platter.avif', isBestSeller: false },
  { id: '6', name: 'Grilled Gyoza', description: 'Japanese dumplings filled with pork and vegetables, served with ponzu sauce', price: 8.9, categoryId: 'antipasti', imageUrl: '/images/gyoza.avif', isBestSeller: false },
];

// Reusable Image component with loading spinner
function ImageWithLoader({ src, alt, className, ...props }) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {imageLoading && <div className="menu-image-spinner"></div>}
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

const formatPrice = (price) => `€${Number(price).toFixed(2)}`;

const MenuPreview = () => {
  const { data: firebaseCategories } = useCollection('menuCategories');
  const { data: firebaseItems } = useCollection('menuItems');

  const categories =
    firebaseCategories && firebaseCategories.length > 0
      ? firebaseCategories
      : fallbackCategories;

  const allItems =
    firebaseItems && firebaseItems.length > 0 ? firebaseItems : fallbackItems;

  const [isMobile, setIsMobile] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [showAllergens, setShowAllergens] = useState(false);

  const toggleFlip = useCallback((itemId) => {
    setFlippedCards((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (window.innerWidth <= 768) return; // Disable parallax on mobile
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 25; // Subtle tilt
    const angleY = (x - xc) / 25; // Subtle tilt
    card.style.setProperty("--rx", `${angleX}deg`);
    card.style.setProperty("--ry", `${angleY}deg`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    if (window.innerWidth <= 768) return; // Disable parallax on mobile
    const card = e.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build curated homepage items: featured first, then best sellers, then others
  const displayItems = (() => {
    const featured = allItems.filter(item => item.isFeatured);
    const bestSellers = allItems.filter(item => item.isBestSeller && !item.isFeatured);
    const others = allItems.filter(item => !item.isFeatured && !item.isBestSeller);
    return [...featured, ...bestSellers, ...others].slice(0, 8);
  })();

  const mobileDisplayItems = displayItems.slice(0, 4);
  const topItems = displayItems.slice(0, 3);
  const bannerItem = displayItems.length > 3 ? displayItems[3] : null;
  const bottomItems = displayItems.slice(4, 8);

  const getImage = (item) => {
    return item.imageUrl || imageMap[item.name] || '/images/dragon-roll.avif';
  };

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
                    <Star size={16} fill="currentColor" /> Best Sellers
                  </span>
                </div>
                {mobileDisplayItems.map((item) => {
                  const hasMedia = item.imageUrl || imageMap[item.name];
                  const isVideo = hasMedia && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "");
                  return (
                    <motion.div
                      key={item.id}
                      className="menu-flip-card"
                      variants={cardVariants}
                      onClick={() => toggleFlip(item.id)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className={`menu-flip-card__inner ${flippedCards[item.id] ? 'is-flipped' : ''}`}>
                        <div className="menu-flip-card__face menu-flip-card__front">
                          <div className="menu-section__card-image-wrapper">
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
                                  src={item.imageUrl || imageMap[item.name]}
                                  alt={item.name}
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
                          </div>
                          <div className="menu-section__card-body">
                            <h3 className="menu-section__card-name">{item.name}</h3>
                            {(item.highlights || itemHighlights[item.name]) && (
                              <div className="menu-section__card-highlights">
                                {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                  <span key={idx} className="menu-highlight-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                            {item.description && (
                              <p className="menu-section__card-description">{item.description}</p>
                            )}
                            <div className="menu-section__card-footer">
                              <div className="menu-price-wrapper">
                                {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                  <span className="menu-price-original">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                                <span className="menu-section__card-price">{formatPrice(item.price)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="menu-flip-card__face menu-flip-card__back">
                          {item.isBestSeller && (
                            <span className="menu-modal-badge menu-modal-badge--back">Best Seller</span>
                          )}
                          <h3 className="menu-flip-card__back-title">{item.name}</h3>
                          {(item.highlights || itemHighlights[item.name]) && (
                            <div className="menu-flip-card__back-highlights">
                              {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                <span key={idx} className="menu-highlight-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <p className="menu-flip-card__back-description">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : displayItems.length > 0 ? (
              <>
                <div className="menu-section__grid-3">
                  {topItems.map((item) => {
                    const hasMedia = item.imageUrl || imageMap[item.name];
                    const isVideo = hasMedia && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "");
                    return (
                      <motion.div
                        key={item.id}
                        className="menu-flip-card"
                        variants={cardVariants}
                        onClick={() => toggleFlip(item.id)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className={`menu-flip-card__inner ${flippedCards[item.id] ? 'is-flipped' : ''}`}>
                          <div className="menu-flip-card__face menu-flip-card__front">
                            <div className="menu-section__card-image-wrapper">
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
                                    src={item.imageUrl || imageMap[item.name]}
                                    alt={item.name}
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
                            </div>
                            <div className="menu-section__card-body">
                              <h3 className="menu-section__card-name">{item.name}</h3>
                              {(item.highlights || itemHighlights[item.name]) && (
                                <div className="menu-section__card-highlights">
                                  {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                    <span key={idx} className="menu-highlight-tag">{tag}</span>
                                  ))}
                                </div>
                              )}
                              {item.description && (
                                <p className="menu-section__card-description">{item.description}</p>
                              )}
                              <div className="menu-section__card-footer">
                                <div className="menu-price-wrapper">
                                  {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                    <span className="menu-price-original">
                                      {formatPrice(item.originalPrice)}
                                    </span>
                                  )}
                                  <span className="menu-section__card-price">{formatPrice(item.price)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="menu-flip-card__face menu-flip-card__back">
                            {item.isBestSeller && (
                              <span className="menu-modal-badge menu-modal-badge--back">Best Seller</span>
                            )}
                            <h3 className="menu-flip-card__back-title">{item.name}</h3>
                            {(item.highlights || itemHighlights[item.name]) && (
                              <div className="menu-flip-card__back-highlights">
                                {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                  <span key={idx} className="menu-highlight-tag">{tag}</span>
                                ))}
                              </div>
                            )}
                            <p className="menu-flip-card__back-description">{item.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {bannerItem && (
                  <motion.div className="menu-section__banner" variants={cardVariants}>
                    <div className="menu-section__banner-image">
                      <ImageWithLoader src={getImage(bannerItem)} alt={bannerItem.name} loading="lazy" />
                    </div>
                    <div className="menu-section__banner-body">
                      <div>
                        <h3>{bannerItem.name}</h3>
                        {(bannerItem.highlights || itemHighlights[bannerItem.name]) && (
                          <div className="menu-section__card-highlights" style={{ marginTop: '8px' }}>
                            {(bannerItem.highlights || itemHighlights[bannerItem.name]).map((tag, idx) => (
                              <span key={idx} className="menu-highlight-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <p>{bannerItem.description}</p>
                      </div>
                      <div className="menu-section__banner-action">
                        <div className="menu-price-wrapper" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          {bannerItem.originalPrice && Number(bannerItem.originalPrice) > Number(bannerItem.price) && (
                            <span className="menu-price-original" style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)', fontSize: '0.85em', opacity: 0.7 }}>
                              {formatPrice(bannerItem.originalPrice)}
                            </span>
                          )}
                          <span className="menu-section__banner-price">{formatPrice(bannerItem.price)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {bottomItems.length > 0 && (
                  <div className="menu-section__grid-4">
                    {bottomItems.map((item) => {
                      const hasMedia = item.imageUrl || imageMap[item.name];
                      const isVideo = hasMedia && /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "");
                      return (
                        <motion.div
                          key={item.id}
                          className="menu-flip-card"
                          variants={cardVariants}
                          onClick={() => toggleFlip(item.id)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className={`menu-flip-card__inner ${flippedCards[item.id] ? 'is-flipped' : ''}`}>
                            <div className="menu-flip-card__face menu-flip-card__front">
                              <div className="menu-section__card-image-wrapper">
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
                                      src={item.imageUrl || imageMap[item.name]}
                                      alt={item.name}
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
                              </div>
                              <div className="menu-section__card-body">
                                <h3 className="menu-section__card-name">{item.name}</h3>
                                {(item.highlights || itemHighlights[item.name]) && (
                                  <div className="menu-section__card-highlights">
                                    {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                      <span key={idx} className="menu-highlight-tag">{tag}</span>
                                    ))}
                                  </div>
                                )}
                                {item.description && (
                                  <p className="menu-section__card-description">{item.description}</p>
                                )}
                                <div className="menu-section__card-footer">
                                  <div className="menu-price-wrapper">
                                    {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                      <span className="menu-price-original">
                                        {formatPrice(item.originalPrice)}
                                      </span>
                                    )}
                                    <span className="menu-section__card-price">{formatPrice(item.price)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="menu-flip-card__face menu-flip-card__back">
                              {item.isBestSeller && (
                                <span className="menu-modal-badge menu-modal-badge--back">Best Seller</span>
                              )}
                              <h3 className="menu-flip-card__back-title">{item.name}</h3>
                              {(item.highlights || itemHighlights[item.name]) && (
                                <div className="menu-flip-card__back-highlights">
                                  {(item.highlights || itemHighlights[item.name]).map((tag, idx) => (
                                    <span key={idx} className="menu-highlight-tag">{tag}</span>
                                  ))}
                                </div>
                              )}
                              <p className="menu-flip-card__back-description">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <motion.p
                style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No dishes in this category.
              </motion.p>
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
