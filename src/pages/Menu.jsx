import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useFirestore";
import { Search, AlertCircle, X, Info } from "lucide-react";
import AllergenModal from "../components/common/AllergenModal";
import { MenuSkeleton } from "../components/common/SkeletonComponents";
import FloatingFood from "../components/home/FloatingFood";
import "../styles/menu.css";

const imageMap = {
  "Dragon Roll": "/images/dragon-roll.avif",
  "Premium Mixed Sashimi": "/images/sashimi-platter.avif",
  "Tonkotsu Ramen": "/images/tonkotsu-ramen.avif",
  "Rainbow Roll": "/images/rainbow-roll.avif",
  "Mixed Tempura": "/images/tempura-platter.avif",
  "Grilled Gyoza": "/images/gyoza.avif",
  "California Roll": "/images/dragon-roll.avif",
  "Spicy Tuna Roll": "/images/rainbow-roll.avif",
  "Philadelphia Roll": "/images/dragon-roll.avif",
  "Volcano Roll": "/images/rainbow-roll.avif",
  "Salmon Sashimi": "/images/sashimi-platter.avif",
  "Tuna Sashimi": "/images/sashimi-platter.avif",
  "Salmon Nigiri": "/images/sashimi-platter.avif",
  "Shrimp Nigiri": "/images/sashimi-platter.avif",
  "Tuna Nigiri": "/images/sashimi-platter.avif",
  "Shoyu Ramen": "/images/tonkotsu-ramen.avif",
  "Vegetarian Miso Ramen": "/images/tonkotsu-ramen.avif",
  "Shrimp Tempura": "/images/tempura-platter.avif",
  "Vegetable Tempura": "/images/tempura-platter.avif",
  "Edamame": "/images/gyoza.avif",
  "Takoyaki": "/images/gyoza.avif",
  "Sake Premium": "/images/sashimi-platter.avif",
  "Matcha Latte": "/images/gyoza.avif",
  "Mochi Ice Cream": "/images/gyoza.avif",
  "Dorayaki": "/images/gyoza.avif",
};

const itemHighlights = {
  'Dragon Roll': ['🔥 Chef\'s Pick', '🥑 Fresh Avocado'],
  'Premium Mixed Sashimi': ['🌊 Wild-caught', '✨ Premium Quality'],
  'Tonkotsu Ramen': ['⏳ 18hr broth', '🥚 Marinated Egg'],
  'Rainbow Roll': ['🌈 4 Fish Types', '🔥 Top Seller'],
  'Mixed Tempura': ['🍤 Crispy', '🌱 Seasonal Veg'],
  'Grilled Gyoza': ['🥟 Hand-made', '🔥 Grilled to order']
};

const formatPrice = (price, price6, isCard = false) => {
  const hasPrice = price !== undefined && price !== null && price !== "";
  const hasPrice6 = price6 !== undefined && price6 !== null && price6 !== "";
  
  if (hasPrice && hasPrice6) {
    const p1 = Number(price).toFixed(2);
    const p6 = Number(price6).toFixed(2);
    return isCard ? `1 pz: €${p1} | 6 pz: €${p6}` : `1pz €${p1} | 6pz €${p6}`;
  }
  if (hasPrice6) {
    const p6 = Number(price6).toFixed(2);
    return isCard ? `6 pz: €${p6}` : `6pz €${p6}`;
  }
  if (hasPrice) {
    return `€${Number(price).toFixed(2)}`;
  }
  return "";
};

// Reusable Image component with loading shimmer
const FALLBACK_IMAGE = "/images/logo.avif";

function ImageWithLoader({ src, alt, className, ...props }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {imageLoading && <div className="menu-image-shimmer skeleton-shimmer"></div>}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
        }}
        style={{ 
          opacity: imageLoading ? 0 : (imgSrc === FALLBACK_IMAGE ? 0.20 : 1),
          objectFit: imgSrc === FALLBACK_IMAGE ? "contain" : "cover",
          padding: imgSrc === FALLBACK_IMAGE ? "16px" : "0"
        }}
        {...props}
      />
    </div>
  );
}

export default function Menu() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const itemParam = searchParams.get("item");

  const { data: categories } = useCollection("menuCategories");
  const { data: items, loading } = useCollection("menuItems");
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const [showAllergens, setShowAllergens] = useState(false);
  const [selectedModalItem, setSelectedModalItem] = useState(null);

  // Parse URL query parameters to auto-select category or auto-open specific item details
  useEffect(() => {
    if (loading) return;

    if (itemParam && items && items.length > 0) {
      const matchedItem = items.find((i) => i.id === itemParam);
      if (matchedItem) {
        setSelectedModalItem(matchedItem);
        if (matchedItem.categoryId) {
          setActiveCategory(matchedItem.categoryId);
        }
        setTimeout(() => {
          tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } else if (categoryParam) {
      setActiveCategory(categoryParam);
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [categoryParam, itemParam, items, loading]);

  useEffect(() => {
    if (selectedModalItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedModalItem]);
  const tabsRef = useRef(null);

  const toggleFlip = useCallback((itemId) => {
    setFlippedCards((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const handleCategoryChangeAndScroll = useCallback((catId, itemId = null) => {
    setActiveCategory(catId);
    if (itemId) {
      setFlippedCards({ [itemId]: true });
    }
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
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

  const currentCategory = searchQuery.trim() 
    ? "search-active" 
    : (activeCategory || "all");

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    } else if (currentCategory && currentCategory !== "all") {
      result = result.filter((item) => item.categoryId === currentCategory);
    }
    return result;
  }, [items, currentCategory, searchQuery]);

  const getImage = (item) => item.imageUrl || imageMap[item.name] || "/images/dragon-roll.avif";

  const floatingFoodItems = useMemo(() => {
    const isAllCategory = currentCategory === "all";
    if (isAllCategory) {
      return [
        {
          src: '/images/decorations/single-nigiri.png',
          position: 'right',
          top: '10%',
          size: 'lg',
          rotate: '-15deg',
          opacity: 0.12,
        },
        {
          src: '/images/decorations/single-tempura.png',
          position: 'left',
          top: '22%',
          size: 'lg',
          rotate: '18deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/single-maki.png',
          position: 'right',
          top: '34%',
          size: 'md',
          rotate: '-8deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/sushi-nigiri.png',
          position: 'left',
          top: '46%',
          size: 'lg',
          rotate: '-25deg',
          opacity: 0.12,
        },
        {
          src: '/images/decorations/chopsticks.png',
          position: 'right',
          top: '58%',
          size: 'lg',
          rotate: '22deg',
          opacity: 0.12,
        },
        {
          src: '/images/decorations/maki-rolls.png',
          position: 'left',
          top: '70%',
          size: 'lg',
          rotate: '20deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/single-wasabi.png',
          position: 'right',
          top: '82%',
          size: 'md',
          rotate: '24deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/single-tempura.png',
          position: 'left',
          top: '92%',
          size: 'lg',
          rotate: '-15deg',
          opacity: 0.12,
        },
      ];
    } else {
      // Reduced items for specific category pages to prevent layout crowding on shorter pages
      return [
        {
          src: '/images/decorations/single-nigiri.png',
          position: 'right',
          top: '15%',
          size: 'lg',
          rotate: '-15deg',
          opacity: 0.12,
        },
        {
          src: '/images/decorations/single-tempura.png',
          position: 'left',
          top: '40%',
          size: 'lg',
          rotate: '18deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/chopsticks.png',
          position: 'right',
          top: '65%',
          size: 'lg',
          rotate: '22deg',
          opacity: 1,
        },
        {
          src: '/images/decorations/maki-rolls.png',
          position: 'left',
          top: '88%',
          size: 'lg',
          rotate: '20deg',
          opacity: 0.12,
        },
      ];
    }
  }, [currentCategory]);

  return (
    <main className="menu-section">
      <Helmet>
        <title>Our Menu - Kyō-To Sushi Catania</title>
        <meta name="description" content="Explore the authentic menu of Kyō-To Sushi Catania. From Dragon Rolls to 18-hour Tonkotsu Ramen, discover our fresh, premium Japanese cuisine." />
        <meta property="og:title" content="Our Menu - Kyō-To Sushi Catania" />
        <meta property="og:description" content="Explore the authentic menu of Kyō-To Sushi Catania. Fresh, premium Japanese cuisine." />
        <meta property="og:url" content="https://www.kyotosushicatania.com/menu" />
      </Helmet>

      {/* Floating Foods Behind Menu Items */}
      <FloatingFood
        className="floating-food--behind"
        items={floatingFoodItems}
      />
      <motion.div
        className="menu-section__logo-lockup"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img
          src="/images/logo.avif"
          alt="Kyō-To"
          className="menu-section__logo"
        />
      </motion.div>

      <div className="menu-section__header">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our Menu
        </motion.h1>
        <div className="section-divider"></div>
        <p className="section-subtitle">
          Discover all the authentic flavors of Japanese cuisine
        </p>

        <div className="menu-search-and-filter-row">
          <div className="menu-search-bar" style={{ margin: 0 }}>
            <Search size={18} className="menu-search-icon" />
            <input
              type="text"
              placeholder="Search the menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="menu-search-input"
            />
          </div>
          <button 
            onClick={() => setShowAllergens(true)}
            className="menu-allergens-btn"
            title="Visualizza Allergeni"
          >
            <AlertCircle size={18} />
            <span>Allergeni</span>
          </button>
        </div>
      </div>

      {!searchQuery && (
        <div ref={tabsRef} className="menu-section__tabs">
          <button
            className={`menu-section__tab ${currentCategory === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
          >
            <span className="menu-category-icon" style={{ marginRight: '8px' }}>🍽️</span>
            <span>All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-section__tab ${currentCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery("");
              }}
            >
              <span className="menu-category-icon" style={{ marginRight: '8px' }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <MenuSkeleton />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery || currentCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%" }}
          >
            {currentCategory === "all" ? (
              <div className="menu-all-categories-list">
                {categories.map((cat) => {
                  const catItems = items.filter((item) => item.categoryId === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="menu-all-cat-section">
                      <h2 className="menu-all-cat-title" onClick={() => handleCategoryChangeAndScroll(cat.id)}>
                        <span style={{ marginRight: '10px' }}>{cat.icon}</span>
                        {cat.name}
                      </h2>
                      <div className="menu-all-cat-items">
                        {catItems.map((item) => (
                          <div 
                            key={item.id} 
                            className="menu-all-dotted-item" 
                            onClick={() => {
                              setFlippedCards((prev) => ({ ...prev, [item.id]: false }));
                              setSelectedModalItem(item);
                            }}
                          >
                            <div className="menu-all-dotted-main">
                              <span className="menu-all-dotted-name">{item.name}</span>
                              <span className="menu-all-dotted-connector"></span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="menu-all-dotted-price">{formatPrice(item.price, item.price6, false)}</span>
                                <Info size={14} className="menu-all-dotted-info-icon" style={{ color: 'var(--color-brand-gold)', opacity: 0.6, flexShrink: 0 }} />
                              </div>
                            </div>
                            {item.description && (
                              <p className="menu-all-dotted-desc">{item.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="menu-section__grid-4">
                {filteredItems.map((item, index) => {
                  const hasMedia = item.imageUrl || imageMap[item.name];
                  const isVideo = hasMedia && (/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "") || /\/video\/upload\//i.test(item.imageUrl || ""));
                  return (
                    <motion.div
                      key={item.id}
                      className="menu-flip-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => toggleFlip(item.id)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className={`menu-flip-card__inner ${flippedCards[item.id] ? 'is-flipped' : ''}`}>
                        {/* ---- FRONT FACE ---- */}
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
                                <img src="/images/logo.avif" alt="" className="placeholder-logo" />
                              </div>
                            )}
                            <div className="menu-card-hint-badge">
                              <Info size={12} />
                              <span>Info</span>
                            </div>
                            {item.isBestSeller && (
                              <span className="menu-modal-badge">Best Seller</span>
                            )}
                            {!item.isAvailable && (
                              <div className="menu-card-unavailable">Unavailable</div>
                            )}
                            {item.hasPhotoDisclaimer && (
                              <div className="menu-card-photo-disclaimer">
                                Photo may not exactly represent the actual dish
                              </div>
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
                            <div className="menu-price-wrapper">
                              {item.price && item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                <span className="menu-price-original">
                                  €{Number(item.originalPrice).toFixed(2)}
                                </span>
                              )}
                              <span className="menu-section__card-price">
                                {formatPrice(item.price, item.price6, true)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ---- BACK FACE ---- */}
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
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="menu-empty">
          <p>No dishes found</p>
        </div>
      )}


      {/* Detail Modal for Dotted Menu Items */}
      <AnimatePresence>
        {selectedModalItem && (
          <div className="menu-detail-modal-backdrop" onClick={() => setSelectedModalItem(null)}>
            <motion.div
              className="menu-detail-modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="menu-detail-modal-close" onClick={() => setSelectedModalItem(null)}>
                <X size={24} />
              </button>
              
              <div className="menu-detail-modal-card-wrapper">
                {(() => {
                  const item = selectedModalItem;
                  const hasMedia = item.imageUrl || imageMap[item.name];
                  const isVideo = hasMedia && (/\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl || "") || /\/video\/upload\//i.test(item.imageUrl || ""));
                  return (
                    <div
                      className="menu-flip-card menu-flip-card--modal"
                      onClick={() => toggleFlip(item.id)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className={`menu-flip-card__inner ${flippedCards[item.id] ? 'is-flipped' : ''}`}>
                        {/* ---- FRONT FACE ---- */}
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
                                <img src="/images/logo.avif" alt="" className="placeholder-logo" />
                              </div>
                            )}
                            <div className="menu-card-hint-badge">
                              <Info size={12} />
                              <span>Info</span>
                            </div>
                            {item.isBestSeller && (
                              <span className="menu-modal-badge">Best Seller</span>
                            )}
                            {!item.isAvailable && (
                              <div className="menu-card-unavailable">Unavailable</div>
                            )}
                            {item.hasPhotoDisclaimer && (
                              <div className="menu-card-photo-disclaimer">
                                Photo may not exactly represent the actual dish
                              </div>
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
                            <div className="menu-price-wrapper">
                              {item.price && item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                                <span className="menu-price-original">
                                  €{Number(item.originalPrice).toFixed(2)}
                                </span>
                              )}
                              <span className="menu-section__card-price">
                                {formatPrice(item.price, item.price6, true)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ---- BACK FACE ---- */}
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
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AllergenModal isOpen={showAllergens} onClose={() => setShowAllergens(false)} />
    </main>
  );
}
