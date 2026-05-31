import { useRef, useState, useEffect } from 'react';
import { useCollection } from '../../hooks/useFirestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/menu-gallery.css';

function GalleryMediaItem({ item }) {
  const [mediaLoading, setMediaLoading] = useState(true);
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} draggable={false}>
      {mediaLoading && <div className="menu-gallery__image-spinner"></div>}
      {isVideo ? (
        <video
          src={item.imageUrl}
          className="menu-gallery__media"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setMediaLoading(false)}
          onCanPlay={() => setMediaLoading(false)}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{ opacity: mediaLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
        />
      ) : (
        <img
          src={item.imageUrl}
          alt={item.title || "Menu Dish"}
          className="menu-gallery__media"
          loading="lazy"
          onLoad={() => setMediaLoading(false)}
          onError={() => setMediaLoading(false)}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{ opacity: mediaLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
        />
      )}
    </div>
  );
}

const MenuGallery = () => {
  const { data: galleryItems, loading } = useCollection('galleryItems', {
    orderByField: 'order',
    realtime: true,
  });

  const carouselRef = useRef(null);
  const activeItems = galleryItems?.filter(item => item.active !== false) || [];

  // Dragging states
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Autoplay states/refs
  const requestRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const userInteractedRef = useRef(false);

  // Autoplay loop
  useEffect(() => {
    const container = carouselRef.current;
    if (!container || activeItems.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const animate = () => {
      // Only scroll if not hovered, not actively dragging, and no recent user interaction
      if (!isHovered && !isDownRef.current && !userInteractedRef.current) {
        container.scrollLeft += 0.8; // Smooth scrolling speed

        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeItems.length, isHovered]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // Button navigation scrolling
  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    userInteractedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 3000); // Resume autoplay after 3 seconds of button idle
    
    const card = carousel.querySelector('.menu-gallery__card');
    const scrollAmount = card ? card.offsetWidth + 24 : 344;
    
    let targetScroll = carousel.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    // Smooth scroll navigation
    carousel.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Drag interaction handlers
  const handleDragStart = (clientX) => {
    const container = carouselRef.current;
    if (!container) return;
    isDownRef.current = true;
    setIsDragging(true);
    userInteractedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    startXRef.current = clientX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleDragMove = (clientX) => {
    if (!isDownRef.current) return;
    const container = carouselRef.current;
    if (!container) return;

    const x = clientX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Drag speed sensitivity multiplier
    let newScrollLeft = scrollLeftRef.current - walk;

    // Infinite wrapping logic during drag
    const halfWidth = container.scrollWidth / 2;
    if (newScrollLeft >= halfWidth) {
      newScrollLeft -= halfWidth;
      startXRef.current = x;
      scrollLeftRef.current = newScrollLeft;
    } else if (newScrollLeft < 0) {
      newScrollLeft += halfWidth;
      startXRef.current = x;
      scrollLeftRef.current = newScrollLeft;
    }

    container.scrollLeft = newScrollLeft;
  };

  const handleDragEnd = () => {
    if (isDownRef.current) {
      isDownRef.current = false;
      setTimeout(() => setIsDragging(false), 50);

      // Resume autoplay after 2.5 seconds of drag idle
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        userInteractedRef.current = false;
      }, 2500);
    }
  };

  // Event binders
  const onMouseDown = (e) => handleDragStart(e.pageX);
  const onMouseMove = (e) => {
    e.preventDefault();
    handleDragMove(e.pageX);
  };
  
  const onTouchStart = (e) => handleDragStart(e.touches[0].pageX);
  const onTouchMove = (e) => handleDragMove(e.touches[0].pageX);

  if (loading) {
    return (
      <section className="menu-gallery-section" id="gallery">
        <div className="menu-gallery__header">
          <div className="menu-gallery__header-text">
            <h2 className="section-title">Visual Gallery</h2>
            <div className="section-divider menu-gallery__divider"></div>
            <p className="section-subtitle">
              A glimpse of our contemporary creations, fresh ingredients, and culinary art
            </p>
          </div>
        </div>
        <div className="menu-gallery__loading-container">
          <div className="menu-gallery__spinner"></div>
        </div>
      </section>
    );
  }

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section className="menu-gallery-section" id="gallery">
      <div className="menu-gallery__header">
        <div className="menu-gallery__header-text">
          <h2 className="section-title">Visual Gallery</h2>
          <div className="section-divider menu-gallery__divider"></div>
          <p className="section-subtitle">
            A glimpse of our contemporary creations, fresh ingredients, and culinary art
          </p>
        </div>

        <div className="menu-gallery__nav-buttons">
          <button 
            className="menu-gallery__nav-btn" 
            onClick={() => scroll('left')} 
            aria-label="Previous Media"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="menu-gallery__nav-btn" 
            onClick={() => scroll('right')} 
            aria-label="Next Media"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        className="menu-gallery__carousel-wrapper" 
        ref={carouselRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleDragEnd();
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleDragEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="menu-gallery__track">
          {/* Render first set */}
          {activeItems.map((item, idx) => (
            <div 
              key={`g1-${item.id}-${idx}`} 
              className="menu-gallery__card"
              draggable={false}
            >
              <GalleryMediaItem item={item} />
              {item.title && (
                <div className="menu-gallery__info-overlay">
                  <span className="menu-gallery__item-title">{item.title}</span>
                </div>
              )}
            </div>
          ))}
          {/* Render second set for seamless infinite looping */}
          {activeItems.map((item, idx) => (
            <div 
              key={`g2-${item.id}-${idx}`} 
              className="menu-gallery__card"
              draggable={false}
            >
              <GalleryMediaItem item={item} />
              {item.title && (
                <div className="menu-gallery__info-overlay">
                  <span className="menu-gallery__item-title">{item.title}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuGallery;
