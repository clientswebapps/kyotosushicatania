import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import { Link } from 'react-router-dom';
import ScrollHint from './ScrollHint';
import ItemModal from '../common/ItemModal';
import '../../styles/promotions.css';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const PromotionsSection = () => {
  const { data: allPromotions, loading } = useCollection('promotions', {
    orderByField: 'order',
    realtime: true,
  });

  const promotions = allPromotions?.filter(promo => promo.active !== false) || [];

  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const offsetRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragOffsetStart = useRef(0);
  const hasDragged = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const isHoveredRef = useRef(false);

  const items = promotions ? promotions.slice(0, 4) : [];
  // Duplicate items 3x for seamless looping
  const loopItems = items.length > 0 ? [...items, ...items, ...items] : [];

  // Keep ref in sync with state
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!isDragging.current && !isHoveredRef.current) {
      offsetRef.current += 0.4; // very slow auto-scroll

      // Calculate half width (one full set of items)
      const cardEls = track.querySelectorAll('.promotions__card');
      const itemCount = items.length;
      if (cardEls.length > 0 && itemCount > 0) {
        let halfWidth = 0;
        for (let i = 0; i < itemCount; i++) {
          halfWidth += cardEls[i].offsetWidth + 24; // 24px gap
        }
        if (offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth;
        }
      }
    }

    track.style.transform = `translateX(-${offsetRef.current}px)`;
    animationRef.current = requestAnimationFrame(animate);
  }, [items.length]);

  useEffect(() => {
    if (loopItems.length === 0) return;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate, loopItems.length]);

  // --- Pointer drag for free swipe ---
  const handlePointerDown = (e) => {
    isDragging.current = true;
    hasDragged.current = false;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragOffsetStart.current = offsetRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const delta = dragStartX.current - clientX;
    if (Math.abs(delta) > 3) hasDragged.current = true;
    offsetRef.current = dragOffsetStart.current + delta;

    // Clamp to prevent negative offset
    if (offsetRef.current < 0) offsetRef.current = 0;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const onCardClick = (e, promo) => {
    if (hasDragged.current) {
      e.preventDefault();
      return;
    }
    if (!promo.link) {
      e.preventDefault();
      setSelectedPromo(promo);
    }
  };

  if (loading || !promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className="promotions-section" id="promotions">
      <div className="promotions__header">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          Featured Offers
        </motion.h2>
        <div className="section-divider"></div>
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

      <div
        className="promotions__carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handlePointerUp(); }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div
          className="promotions__track"
          ref={trackRef}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          {loopItems.map((promo, index) => (
            <Link
              key={`${promo.id}-${index}`}
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

      <ScrollHint targetId="menu-preview" text="Menu" />
      <ItemModal 
        isOpen={!!selectedPromo} 
        onClose={() => setSelectedPromo(null)} 
        item={selectedPromo} 
      />
    </section>
  );
};

export default PromotionsSection;
