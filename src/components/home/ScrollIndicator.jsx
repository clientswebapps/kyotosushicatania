import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'promotions', label: 'Offers' },
  { id: 'menu-preview', label: 'Menu' },
  { id: 'about-us', label: 'About' },
  { id: 'contact-us', label: 'Contact' },
];

const ScrollIndicator = ({ containerRef }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Track which section is in view
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      // Find the section closest to the center of the viewport
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const el = document.getElementById(section.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;
        const sectionCenter = relativeTop + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);

      // Show indicator after scrolling a bit
      setIsVisible(scrollTop > 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="scroll-indicator__track">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`scroll-indicator__dot ${
                  index === activeIndex ? 'scroll-indicator__dot--active' : ''
                }`}
                onClick={() => scrollToSection(section.id)}
                aria-label={`Go to ${section.label}`}
              >
                <span className="scroll-indicator__label">{section.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicator;
