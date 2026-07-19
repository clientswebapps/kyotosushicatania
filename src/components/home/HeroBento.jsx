import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Compass, RefreshCw, ChevronRight, Gift } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import { generateRoundWavyPath } from '../../utils/wavyPath';
import '../../styles/hero-bento.css';

// Fallback Welcome Slides (Hero Settings) if database is empty
const fallbackSlides = [
  {
    id: 'fallback-1',
    tagline: 'Contemporary Japanese Cuisine',
    title: 'Welcome to Kyō-To',
    subtitle: 'Japanese Asian Contemporary Cuisine in the heart of Catania. Experience our handcrafted premium selection.',
    ctaText: 'Explore Menu',
    ctaLink: '/menu',
    imageUrl: '/images/dragon-roll.avif',
  },
  {
    id: 'fallback-2',
    tagline: 'Handcrafted Premium Selection',
    title: 'Fresh Sushi Every Day',
    subtitle: 'Carefully selected ingredients prepared fresh daily for a unique fine dining experience.',
    ctaText: 'Reserve Now',
    ctaLink: '/contact',
    imageUrl: '/images/sashimi-platter.avif',
  }
];

// Default static fallback promotions if database is empty
const defaultPromotions = [
  {
    id: 'default-promo-1',
    title: "Stay Tuned!",
    description: "New offers and seasonal promotions are coming soon. Install our app to receive instant notifications and never miss a deal!",
    link: "",
    badge: "Promotions"
  }
];

// Default static fallback items for daily recommendations if database is empty
const fallbackMenuItems = [
  {
    id: "fb-1",
    name: "Dragon Roll",
    description: "Maki con gambero in tempura ed avocado, coperto con fettine di avocado, unito alla maionese e salsa teriyaki.",
    price: 14.00,
    rating: 5.0,
    reviewsCount: 48,
    highlight: "🔥 Chef's Pick",
    imageUrl: "/images/dragon-roll.avif"
  },
  {
    id: "fb-2",
    name: "Premium Mixed Sashimi",
    description: "Pregiato sashimi misto di salmone, tonno rosso e pesce bianco locale. Pescato selvaggio del giorno tagliato fresco.",
    price: 18.00,
    rating: 5.0,
    reviewsCount: 36,
    highlight: "🌊 Fresh Quality",
    imageUrl: "/images/sashimi-platter.avif"
  },
  {
    id: "fb-3",
    name: "Tonkotsu Ramen",
    description: "Noodles freschi cotti in un denso brodo di maiale artigianale bollito per 18 ore, completato con chashu marinato e uovo ramen.",
    price: 12.50,
    rating: 4.9,
    reviewsCount: 52,
    highlight: "⏳ 18hr Broth",
    imageUrl: "/images/tonkotsu-ramen.avif"
  }
];

// Map of names to static default assets if database has no image
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

const parseFormattedText = (text) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <span key={index} className="brand-highlight">{part}</span>;
    }
    return part;
  });
};

// Date-hashing to select a consistent daily index
const getDailySeedIndex = (length) => {
  if (length === 0) return 0;
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % length;
};

const formatPrice = (price, price6) => {
  const hasPrice = price !== undefined && price !== null && price !== "";
  const hasPrice6 = price6 !== undefined && price6 !== null && price6 !== "";
  
  if (hasPrice && hasPrice6) {
    return `€${Number(price).toFixed(2)}`;
  }
  if (hasPrice) {
    return `€${Number(price).toFixed(2)}`;
  }
  if (hasPrice6) {
    return `€${Number(price6).toFixed(2)}`;
  }
  return "";
};

export default function HeroBento() {
  // 1. Fetch Welcome Slides (Row 1 - Full Width)
  const { data: dbSlides, loading: slidesLoading } = useCollection('heroSlides', {
    realtime: true,
  });
  const slides = dbSlides?.filter(slide => slide.active !== false) || [];
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Video buffering/loading state for the hero banner
  const [videoLoading, setVideoLoading] = useState(false);
  const handleVideoWaiting = useCallback(() => setVideoLoading(true), []);
  const handleVideoCanPlay = useCallback(() => setVideoLoading(false), []);
  const handleVideoLoaded = useCallback(() => setVideoLoading(false), []);

  // Reset video loading state when slide changes
  useEffect(() => {
    setVideoLoading(false);
  }, [currentSlideIndex]);

  // Auto-slide welcome banner every 6 seconds
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  // 2. Fetch Promotions (Row 2 - Left)
  const { data: allPromotions, loading: promoLoading } = useCollection('promotions', {
    orderByField: 'order',
    realtime: true,
  });
  const promotions = allPromotions?.filter(p => p.active !== false) || [];
  const activePromotions = promotions.length > 0 ? promotions : defaultPromotions;
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Reset promotion index on data length changes
  useEffect(() => {
    setCurrentPromoIndex(0);
  }, [activePromotions.length]);

  // Auto-slide promotions every 5 seconds if multiple exist
  useEffect(() => {
    if (activePromotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % activePromotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activePromotions.length]);

  // 3. Fetch Menu Items (Row 2 - Right)
  const { data: dbMenuItems, loading: menuLoading } = useCollection('menuItems', {
    realtime: true,
  });
  const menuItems = dbMenuItems && dbMenuItems.length > 0 ? dbMenuItems : fallbackMenuItems;
  const [recommendedIndex, setRecommendedIndex] = useState(0);

  // Initialize recommendation based on daily date seed
  useEffect(() => {
    if (menuItems.length > 0) {
      setRecommendedIndex(getDailySeedIndex(menuItems.length));
    }
  }, [menuItems.length]);

  const handleShuffleRecommendation = () => {
    if (menuItems.length <= 1) return;
    let nextIndex = recommendedIndex;
    while (nextIndex === recommendedIndex) {
      nextIndex = Math.floor(Math.random() * menuItems.length);
    }
    setImgError(false);   // reset error flag so fallback doesn't linger
    setImgLoading(true);  // show spinner while new image loads
    setRecommendedIndex(nextIndex);
  };

  // Track image load errors separately so we can reset on shuffle
  const [imgError, setImgError] = useState(false);
  // Track image loading state to show spinner while new image fetches
  const [imgLoading, setImgLoading] = useState(true);

  const activeSlide = activeSlides[currentSlideIndex];
  const activePromo = activePromotions[currentPromoIndex];
  const isDefaultPromo = promotions.length === 0;
  const recommendedItem = menuItems[recommendedIndex] || fallbackMenuItems[0];

  const itemRating = recommendedItem.rating || 5.0;
  const reviewsCount = recommendedItem.reviewsCount || Math.floor(15 + (recommendedItem.name.length * 1.5));
  const displayPrice = formatPrice(recommendedItem.price, recommendedItem.price6);
  // Use error-safe resolved image: prefer db url → static map → logo fallback
  const resolvedImage = imgError
    ? "/images/logo.avif"
    : (recommendedItem.imageUrl || imageMap[recommendedItem.name] || "/images/logo.avif");
  const displayHighlight = recommendedItem.highlight || (itemRating >= 5.0 ? "🔥 Top Rated" : "✨ Recommended");

  return (
    <section className="hero-bento-section">
      <div className="hero-bento-grid">
        
        {/* ==================== ROW 1: WELCOME BANNER (FULL WIDTH) ==================== */}
        <div className="bento-card bento-card--hero-slides">
          {/* Background Media (Video/Image) */}
          {activeSlide && (
            <div className="hero-slide-bg-media">
              {(/\.(mp4|webm|ogg)(\?.*)?$/i.test(activeSlide.imageUrl || "") || /\/video\/upload\//i.test(activeSlide.imageUrl || "")) ? (
                <video
                  src={activeSlide.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="hero-slide-media"
                  onWaiting={handleVideoWaiting}
                  onCanPlay={handleVideoCanPlay}
                  onLoadedData={handleVideoLoaded}
                />
              ) : (
                <img
                  src={activeSlide.imageUrl || "/images/dragon-roll.avif"}
                  alt={activeSlide.title || "Hero Background"}
                  className="hero-slide-media"
                  onError={(e) => { 
                    if (e.target.src !== '/images/logo.avif') {
                      e.target.src = '/images/logo.avif';
                      e.target.style.opacity = '0.35';
                      e.target.style.objectFit = 'contain';
                      e.target.style.padding = '80px';
                    }
                  }}
                />
              )}
              <div className="hero-slide-media-overlay" />
            </div>
          )}

          {/* Branded spinner — shown while video buffers OR slides data is loading */}
          {(slidesLoading || videoLoading) && (
            <div className="hero-video-spinner" aria-label="Loading Kyō-To experience" role="status">
              <div className="hero-video-spinner__ring hero-video-spinner__ring--gold"></div>
              <div className="hero-video-spinner__ring hero-video-spinner__ring--red"></div>
              <div className="hero-video-spinner__kanji" aria-hidden="true">京</div>
              <span className="hero-video-spinner__label">LOADING KYŌ-TO EXPERIENCE…</span>
            </div>
          )}

          {!slidesLoading && (
            <div className="hero-slide-content">
              <div>
                <span className="hero-slide__tagline">{parseFormattedText(activeSlide?.tagline || 'Contemporary Japanese Cuisine')}</span>
                <h1 className="hero-slide__title">{parseFormattedText(activeSlide?.title || 'Welcome to Kyō-To')}</h1>
                <p className="hero-slide__subtitle">{parseFormattedText(activeSlide?.subtitle || 'Japanese Asian Contemporary Cuisine')}</p>
              </div>

              <div className="hero-slide__footer">
                <Link to={activeSlide?.ctaLink || '/menu'} className="hero-slide__cta">
                  <span>{activeSlide?.ctaText || 'Explore Menu'}</span>
                  <ChevronRight size={14} />
                </Link>

                {activeSlides.length > 1 && (
                  <div className="promo-dots">
                    {activeSlides.map((_, idx) => (
                      <span
                        key={idx}
                        className={`promo-dot ${idx === currentSlideIndex ? 'promo-dot--active' : ''}`}
                        onClick={() => setCurrentSlideIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================== ROW 2 LEFT: PROMOTIONS ==================== */}
        <div className="bento-card bento-card--promotions" style={{ position: 'relative' }}>
          {/* Background Media for empty state fallback banner (placed as direct child to cover entire card padding) */}
          {!promoLoading && isDefaultPromo && (
            <div className="hero-slide-bg-media">
              <img
                src="/images/sashimi-platter.avif"
                alt="Stay Tuned Background"
                className="hero-slide-media"
                style={{ filter: 'brightness(0.35)' }}
              />
            </div>
          )}

          {promoLoading ? (
            <div className="bento-card-spinner" aria-label="Loading promotions" role="status">
              <div className="bento-card-spinner__ring bento-card-spinner__ring--gold"></div>
              <div className="bento-card-spinner__ring bento-card-spinner__ring--red"></div>
              <div className="bento-card-spinner__kanji" aria-hidden="true">京</div>
              <span className="bento-card-spinner__label">LOADING KYŌ-TO EXPERIENCE…</span>
            </div>
          ) : (
            <div className="promo-slide" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
              <div className="promo-slide__header" style={{ position: 'relative', zIndex: 10, textShadow: '0 2px 8px rgba(0, 0, 0, 0.85)' }}>
                <div>
                  <span className="promo-slide__badge">{activePromo?.badge || "Special Offer"}</span>
                  <h3 className="promo-slide__title" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>{activePromo?.title}</h3>
                  <p className="promo-slide__desc" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}>{activePromo?.description}</p>
                </div>
              </div>
              
              <div className="promo-slide__footer" style={{ position: 'relative', zIndex: 10 }}>
                {!isDefaultPromo && activePromo?.link && (
                  <Link to={activePromo.link} className="promo-slide__btn">
                    <span>Claim Offer</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
                
                {activePromotions.length > 1 && (
                  <div className="promo-dots">
                    {activePromotions.map((_, idx) => (
                      <span
                        key={idx}
                        className={`promo-dot ${idx === currentPromoIndex ? 'promo-dot--active' : ''}`}
                        onClick={() => setCurrentPromoIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================== ROW 2 RIGHT: DAILY MENU RECOMMENDATION ==================== */}
        <div className="bento-card bento-card--recommendation">
          <div className="recommendation-header">
            <h2>
              <Award size={18} />
              <span>Recommended Menu</span>
            </h2>
            <button className="btn-shuffle-recommendation" onClick={handleShuffleRecommendation} aria-label="Show another dish recommendation">
              <RefreshCw size={10} style={{ marginRight: '4px' }} />
              <span>Suggest Another</span>
            </button>
          </div>

          {menuLoading ? (
            <div className="bento-card-spinner" aria-label="Loading menu recommendation" role="status">
              <div className="bento-card-spinner__ring bento-card-spinner__ring--gold"></div>
              <div className="bento-card-spinner__ring bento-card-spinner__ring--red"></div>
              <div className="bento-card-spinner__kanji" aria-hidden="true">京</div>
              <span className="bento-card-spinner__label">LOADING KYŌ-TO EXPERIENCE…</span>
            </div>
          ) : (
            <div className="recommendation-body">
              <div className="recommendation-info">
                <div>
                  <span className="recommendation-badge">{displayHighlight}</span>
                  <h3 className="recommendation-name">{recommendedItem.name}</h3>
                  <div className="recommendation-rating">
                    <div className="recommendation-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className="recommendation-star-filled"
                        />
                      ))}
                    </div>
                    <span className="recommendation-rating-val">
                      {itemRating.toFixed(1)} ({reviewsCount} reviews)
                    </span>
                  </div>
                </div>
                <p className="recommendation-desc">{recommendedItem.description}</p>
              </div>

              <div className="recommendation-img-container">
                {/* Mini branded spinner — shown while dish image is fetching */}
                {imgLoading && (
                  <div className="rec-img-spinner" aria-hidden="true">
                    <div className="rec-img-spinner__ring rec-img-spinner__ring--gold"></div>
                    <div className="rec-img-spinner__ring rec-img-spinner__ring--red"></div>
                    <div className="rec-img-spinner__kanji">京</div>
                  </div>
                )}
                <img
                  key={recommendedItem.id || recommendedIndex}
                  src={resolvedImage}
                  alt={recommendedItem.name}
                  className={`recommendation-img${resolvedImage === '/images/logo.avif' ? ' recommendation-img--logo' : ''}${imgLoading ? ' recommendation-img--hidden' : ''}`}
                  loading="eager"
                  onLoad={() => setImgLoading(false)}
                  onError={(e) => {
                    // Guard: only fall back once — prevents infinite error loops
                    if (e.target.src.includes('logo.avif')) {
                      setImgLoading(false);
                      return;
                    }
                    setImgError(true);
                    setImgLoading(false);
                  }}
                />
              </div>
            </div>
          )}

          <div className="recommendation-footer">
            <span className="recommendation-price">{displayPrice || "€--" }</span>
            <Link to="/menu" className="recommendation-cta">
              <span>View Dish Details</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom round curve cutout with wiggles */}
      <div className="hero-bento-wave-cutout" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d={generateRoundWavyPath()} fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
