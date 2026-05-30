import { useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useCollection } from "../hooks/useFirestore";
import { Search } from "lucide-react";
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

export default function Menu() {
  const { data: categories } = useCollection("menuCategories");
  const { data: items, loading } = useCollection("menuItems");
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flippedCards, setFlippedCards] = useState({});

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

  const currentCategory = activeCategory || (categories.length > 0 ? categories[0].id : null);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    } else if (currentCategory) {
      result = result.filter((item) => item.categoryId === currentCategory);
    }
    return result;
  }, [items, currentCategory, searchQuery]);

  const getImage = (item) => item.imageUrl || imageMap[item.name] || "/images/dragon-roll.avif";

  return (
    <section className="menu-section">
      <Helmet>
        <title>Our Menu - Kyō-To Sushi Catania</title>
        <meta name="description" content="Explore the authentic menu of Kyō-To Sushi Catania. From Dragon Rolls to 18-hour Tonkotsu Ramen, discover our fresh, premium Japanese cuisine." />
        <meta property="og:title" content="Our Menu - Kyō-To Sushi Catania" />
        <meta property="og:description" content="Explore the authentic menu of Kyō-To Sushi Catania. Fresh, premium Japanese cuisine." />
        <meta property="og:url" content="https://www.kyotosushicatania.com/menu" />
      </Helmet>
      <motion.div
        className="menu-section__logo-lockup"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img
          src="/images/logo-white.avif"
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

        <div className="menu-search-bar">
          <Search size={18} className="menu-search-icon" />
          <input
            type="text"
            placeholder="Search the menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>
      </div>

      {!searchQuery && (
        <div className="menu-section__tabs">
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
        <div className="menu-loading">
          <div className="menu-loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery || currentCategory}
            className="menu-section__grid-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {filteredItems.map((item, index) => (
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
                      <img
                        src={getImage(item)}
                        alt={item.name}
                        className="menu-section__card-image"
                        loading="lazy"
                      />
                      {item.isBestSeller && (
                        <span className="menu-modal-badge">Best Seller</span>
                      )}
                      {!item.isAvailable && (
                        <div className="menu-card-unavailable">Unavailable</div>
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
                        {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                          <span className="menu-price-original">
                            €{Number(item.originalPrice).toFixed(2)}
                          </span>
                        )}
                        <span className="menu-section__card-price">
                          €{item.price.toFixed(2)}
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
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="menu-empty">
          <p>No dishes found</p>
        </div>
      )}


    </section>
  );
}
