import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../../hooks/useFirestore';
import { HeroSkeleton } from '../common/SkeletonComponents';
import ItemModal from '../common/ItemModal';
import FloatingFood from './FloatingFood';
import { generateRoundWavyPath } from '../../utils/wavyPath';
import '../../styles/hero.css';

const fallbackSlides = [
  {
    id: 'fallback-1',
    tagline: 'Contemporary Japanese Cuisine',
    title: 'Welcome to Kyō-To',
    subtitle: 'Japanese Asian Contemporary Cuisine in the heart of Catania',
    ctaText: 'Explore the Menu',
    ctaLink: '/menu',
    imageUrl: '/images/dragon-roll.avif',
  },
  {
    id: 'fallback-2',
    tagline: 'Handcrafted Premium Selection',
    title: 'Fresh Sushi Every Day',
    subtitle: 'Selected ingredients for a unique experience',
    ctaText: 'Reserve Now',
    ctaLink: '/contact',
    imageUrl: '/images/sashimi-platter.avif',
  },
  {
    id: 'fallback-3',
    tagline: 'Exclusive Dining Experience',
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

const HeroCarousel = ({ onLoaded }) => {

  const { data: allSlides, loading } = useCollection('heroSlides', {
    realtime: true,
  });

  useEffect(() => {
    if (!loading && onLoaded) {
      onLoaded();
    }
  }, [loading, onLoaded]);

  const firebaseSlides = allSlides?.filter(slide => slide.active !== false) || [];

  const slides =
    firebaseSlides && firebaseSlides.length > 0 ? firebaseSlides : fallbackSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
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

  const activeSlide = slides[currentSlide];

  useEffect(() => {
    if (slides.length <= 1 || !activeSlide) return;

    const delayMs = (Number(activeSlide.duration) || 5) * 1000;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, delayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToNext, slides.length, currentSlide, activeSlide]);

  if (loading) {
    return (
      <HeroSkeleton />
    );
  }

  if (!activeSlide) return null;

  return (
    <section className="hero onboarding-section" id="hero">
      <div className="hero__slides">
        <AnimatePresence initial={false}>
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
                className="hero__slide-image"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              >
                <source src={activeSlide.imageUrl} type={activeSlide.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)?.[1] ? `video/${activeSlide.imageUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)[1].toLowerCase()}` : 'video/mp4'} />
              </video>
            ) : (
              <img
                src={activeSlide.imageUrl}
                alt={activeSlide.title}
                className="hero__slide-image"
                fetchpriority={currentSlide === 0 ? "high" : "auto"}
                width={1920}
                height={1080}
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
              <span className="hero__tagline">
                {(() => {
                  const tag = activeSlide.tagline || "";
                  if (!tag || /destination/i.test(tag)) {
                    return "Premium Sushi Experience";
                  }
                  return tag;
                })()}
              </span>
              <div className="hero__decorations" aria-hidden="true">
                <span className="hero__decoration-star">✦</span>
                <span className="hero__decoration-star hero__decoration-star--large">✦</span>
                <span className="hero__decoration-star">✦</span>
              </div>
              <h1 className="hero__title">
                {(() => {
                  const rawTitle = activeSlide.title || "";
                  const title = rawTitle
                    .replace(/Kyō-To/g, "Kyō\u2011To")
                    .replace(/Kyo-To/g, "Kyo\u2011To");
                  const parts = title.split(/(\*\*[^*]+\*\*)/g);
                  return parts.map((part, idx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      const cleanText = part.slice(2, -2);
                      return <span key={idx} className="text-gold" style={{ whiteSpace: 'nowrap' }}>{cleanText}</span>;
                    }
                    return part;
                  });
                })()}
              </h1>
              <p className="hero__subtitle">{activeSlide.subtitle}</p>
              {activeSlide.ctaLink && (
                <div className="hero__cta-wrapper">
                  <Link to={activeSlide.ctaLink} className="hero__cta">
                    {activeSlide.ctaText || "Scopri di più"}
                  </Link>
                </div>
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

      {/* Bottom round curve cutout with wiggles */}
      <div className="hero__wave-cutout hero__wave-cutout--bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d={generateRoundWavyPath()} fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
};

export default HeroCarousel;
