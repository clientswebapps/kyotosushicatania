import React from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import '../../styles/floating-food.css';

/**
 * FloatingItem — individual floating decoration with smooth scroll parallax and mount fade-in.
 */
const FloatingItem = ({ item, index }) => {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Parallax speed configuration:
  // - Background items (lower opacity / behind) scroll slower (positive speed)
  // - Foreground items scroll slightly faster (negative speed)
  const isBehind = item.opacity !== undefined && item.opacity < 1;
  const defaultSpeed = isBehind ? 0.04 : -0.025;
  const speed = shouldReduceMotion ? 0 : (item.speed !== undefined ? item.speed : defaultSpeed);

  const rawY = useTransform(scrollY, (val) => val * speed);
  const smoothY = useSpring(rawY, { damping: 28, stiffness: 100 });

  // Wrapper Styles — Handles positioning and scroll parallax translation
  const wrapperStyle = {
    y: smoothY,
  };
  if (item.top !== undefined) wrapperStyle.top = item.top;
  if (item.bottom !== undefined) wrapperStyle.bottom = item.bottom;
  if (item.left !== undefined) wrapperStyle.left = item.left;
  if (item.right !== undefined) wrapperStyle.right = item.right;
  if (item.zIndex !== undefined) wrapperStyle.zIndex = item.zIndex;

  // Image Styles — Handles gentle hover/floating loop animations, rotation, and offsets
  const itemStyle = {
    '--float-offsetX': item.offsetX || '0px',
    '--float-offsetY': item.offsetY || '0px',
    '--float-rotate': item.rotate || '0deg',
    animationDelay: `${index * 0.5}s`,
  };

  const targetOpacity = item.opacity !== undefined ? item.opacity : 1;

  // Mount animation configurations
  const initialStyle = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 };
  const animateStyle = shouldReduceMotion ? { opacity: targetOpacity } : { opacity: targetOpacity, scale: 1 };

  return (
    <motion.div
      className={`floating-food__wrapper ${item.position ? `floating-food__item--${item.position}` : ''} ${item.size ? `floating-food__item--${item.size}` : ''}`}
      style={wrapperStyle}
      initial={initialStyle}
      animate={animateStyle}
      transition={{
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Custom premium cubic bezier easeOut
        delay: index * 0.15,
      }}
    >
      <img
        src={item.src}
        alt=""
        role="presentation"
        className="floating-food__item"
        style={itemStyle}
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  );
};

/**
 * FloatingFood — decorative floating food images at section boundaries.
 * 
 * Props:
 *  - items: Array of { src, alt, position ('left'|'right'), size ('sm'|'md'|'lg'), offsetY, offsetX, rotate, opacity, speed }
 *  - className: additional CSS class for the wrapper
 */
const FloatingFood = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`floating-food ${className}`} aria-hidden="true">
      {items.map((item, i) => (
        <FloatingItem key={i} item={item} index={i} />
      ))}
    </div>
  );
};

export default FloatingFood;
