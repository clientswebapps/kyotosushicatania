import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import { Link } from 'react-router-dom';

import ItemModal from '../common/ItemModal';
import '../../styles/promotions.css';

const PromotionsSection = () => {
  const { data: allPromotions, loading } = useCollection('promotions', {
    orderByField: 'order',
    realtime: true,
  });

  const promotions = allPromotions?.filter(promo => promo.active !== false) || [];
  const carouselRef = useRef(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    // Scroll by card width + gap
    const card = carousel.querySelector('.promotions__card');
    const scrollAmount = card ? card.offsetWidth + 24 : 544;
    
    carousel.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const onCardClick = (e, promo) => {
    if (!promo.link) {
      e.preventDefault();
      setSelectedPromo(promo);
    }
  };

  if (loading || !promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className={`promotions-section promotions--items-${promotions.length}`} id="promotions">
      <div className="promotions__header">
        <div className="promotions__header-text">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            Featured Offers
          </motion.h2>
          <div className="section-divider promotions__divider"></div>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover our exclusive seasonal specials and promotions
          </motion.p>
        </div>

        <div className="promotions__nav-buttons">
          <button 
            className="promotions__nav-btn" 
            onClick={() => scroll('left')} 
            aria-label="Previous Promotion"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="promotions__nav-btn" 
            onClick={() => scroll('right')} 
            aria-label="Next Promotion"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="promotions__carousel-wrapper" ref={carouselRef}>
        <div className="promotions__track">
          {promotions.map((promo) => (
            <Link
              key={promo.id}
              to={promo.link || '#'}
              className="promotions__card"
              draggable={false}
              onClick={(e) => onCardClick(e, promo)}
            >
              {/\.(mp4|webm|ogg)(\?.*)?$/i.test(promo.imageUrl) ? (
                <video
                  src={promo.imageUrl}
                  className="promotions__card-bg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : (
                <img
                  src={promo.imageUrl || '/images/dragon-roll.avif'}
                  alt={promo.title}
                  className="promotions__card-bg"
                  loading="lazy"
                  draggable={false}
                />
              )}
              <div className="promotions__overlay"></div>

              <div className="promotions__content">
                {promo.tag && <span className="promotions__tag">{promo.tag}</span>}
                <h3 className="promotions__title">{promo.title}</h3>
                <p className="promotions__description">{promo.description}</p>
                <div className="promotions__cta">
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <ItemModal 
        isOpen={!!selectedPromo} 
        onClose={() => setSelectedPromo(null)} 
        item={selectedPromo} 
      />
    </section>
  );
};

export default PromotionsSection;
