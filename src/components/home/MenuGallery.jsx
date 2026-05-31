import { useRef, useState } from 'react';
import { useCollection } from '../../hooks/useFirestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/menu-gallery.css';

function GalleryMediaItem({ item }) {
  const [mediaLoading, setMediaLoading] = useState(true);
  const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(item.imageUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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

  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    // Scroll by card width + gap (320px + 24px)
    const card = carousel.querySelector('.menu-gallery__card');
    const scrollAmount = card ? card.offsetWidth + 24 : 344;
    
    carousel.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <section className="menu-gallery-section" id="gallery">
        <div className="menu-gallery__header">
          <div className="menu-gallery__header-text">
            <h2 className="section-title">Visual Gallery</h2>
            <div className="section-divider" style={{ margin: '16px auto 0 0' }}></div>
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
          <div className="section-divider" style={{ margin: '16px auto 0 0' }}></div>
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

      <div className="menu-gallery__carousel-wrapper" ref={carouselRef}>
        <div className="menu-gallery__track">
          {activeItems.map((item) => (
            <div 
              key={item.id} 
              className="menu-gallery__card"
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
