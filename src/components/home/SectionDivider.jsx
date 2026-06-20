import React from 'react';
import { generateRoundWavyPath } from '../../utils/wavyPath';

/**
 * SectionDivider — curved SVG shapes for organic section transitions.
 * 
 * Props:
 *  - variant: 'wave' | 'curve' | 'wave-reverse' | 'gentle' | 'hero-wave' (default: 'wave')
 *  - fillColor: CSS color for the shape (default: '#ffffff')
 *  - position: 'top' | 'bottom' (default: 'bottom')
 *  - className: additional CSS class
 */
const paths = {
  wave: 'M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z',
  'wave-reverse': 'M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z',
  curve: 'M0,80 C360,120 1080,20 1440,80 L1440,120 L0,120 Z',
  'gentle': 'M0,90 C480,40 960,120 1440,70 L1440,120 L0,120 Z',
};

// Pre-generate the hero-wave path once (same wiggly path as the hero section)
const heroWavePath = generateRoundWavyPath();

const SectionDivider = ({
  variant = 'wave',
  fillColor = '#ffffff',
  position = 'bottom',
  className = '',
}) => {
  // Use the pre-generated hero-wave path, or fall back to the static paths
  const d = variant === 'hero-wave' ? heroWavePath : (paths[variant] || paths.wave);
  const isTop = position === 'top';

  return (
    <div
      className={`section-divider-wave section-divider-wave--${position} section-divider-wave--${variant} ${className}`}
      aria-hidden="true"
      style={isTop ? { transform: 'rotate(180deg)' } : undefined}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={d} fill={fillColor} />
      </svg>
    </div>
  );
};

export default SectionDivider;
