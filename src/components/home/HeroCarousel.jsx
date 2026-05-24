import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import ScrollHint from './ScrollHint';
import ItemModal from '../common/ItemModal';
import '../../styles/hero.css';

const fallbackSlides = [
  {
    id: 'fallback-1',
    title: 'Welcome to Kyō-To',
    subtitle: 'Japanese Asian Contemporary Cuisine in the heart of Catania',
    ctaText: 'Explore the Menu',
    ctaLink: '/menu',
    imageUrl: '/images/dragon-roll.avif',
  },
  {
    id: 'fallback-2',
    title: 'Fresh Sushi Every Day',
    subtitle: 'Selected ingredients for a unique experience',
    ctaText: 'Reserve Now',
    ctaLink: '/contact',
    imageUrl: '/images/sashimi-platter.avif',
  },
  {
    id: 'fallback-3',
    title: 'Special Promotion',
    subtitle: 'All You Can Eat starting from €24.90',
    ctaText: 'Learn More',
    ctaLink: '/menu',
    imageUrl: '/images/tonkotsu-ramen.avif',
  },
];

const slideVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
    transition: {
      opacity: { duration: 0.8, ease: 'easeInOut' },
    },
  },
  exit: {
    opacity: 0,
    transition: {
      opacity: { duration: 0.6, ease: 'easeInOut' },
    },
  },
};

const contentVariants = {
  enter: {
    opacity: 0,
    x: '-50%',
    y: '-35%',
  },
  center: {
    opacity: 1,
    x: '-50%',
    y: '-50%',
    transition: {
      duration: 0.7,
      delay: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: '-50%',
    y: '-65%',
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

const HeroCarousel = () => {
  const { data: allSlides } = useCollection('heroSlides', {
    realtime: true,
  });

  const firebaseSlides = allSlides?.filter(slide => slide.active !== false) || [];

  const slides =
    firebaseSlides && firebaseSlides.length > 0 ? firebaseSlides : fallbackSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef(null);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToNext, slides.length, currentSlide]);

  const activeSlide = slides[currentSlide];

  if (!activeSlide) return null;

  return (
    <section className="hero onboarding-section" id="hero">
      <div className="hero__slides">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide.id || currentSlide}
            className="hero__slide active"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/\.(mp4|webm|ogg)(\?.*)?$/i.test(activeSlide.imageUrl) ? (
              <video
                src={activeSlide.imageUrl}
                className="hero__slide-image"
                autoPlay
                loop
                muted
                playsInline
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <img
                src={activeSlide.imageUrl}
                alt={activeSlide.title}
                className="hero__slide-image"
              />
            )}
            <div className="hero__overlay" />

            <motion.div
              className="hero__content"
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h1 className="hero__title">
                {activeSlide.title === 'Welcome to Kyō-To' ? (
                  <>
                    Welcome to <span className="text-gold">Kyō-To</span>
                  </>
                ) : (
                  activeSlide.title
                )}
              </h1>
              <p className="hero__subtitle">{activeSlide.subtitle}</p>
              {activeSlide.ctaLink ? (
                <Link to={activeSlide.ctaLink} className="hero__cta">
                  {activeSlide.ctaText}
                </Link>
              ) : (
                <button onClick={() => setModalOpen(true)} className="hero__cta" style={{ border: 'none', cursor: 'pointer' }}>
                  {activeSlide.ctaText}
                </button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            className="hero__arrow hero__arrow--prev"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </button>

          <button
            className="hero__arrow hero__arrow--next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight />
          </button>

          <div className="hero__dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`hero__dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <ScrollHint targetId="promotions" text="View Offers" />
      <ItemModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        item={activeSlide} 
      />
    </section>
  );
};

export default HeroCarousel;
