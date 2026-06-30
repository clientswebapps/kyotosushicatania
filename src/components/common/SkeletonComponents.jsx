import React from 'react';

// Reusable individual Card skeleton
export function MenuCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image skeleton-shimmer"></div>
      <div className="skeleton-card-body">
        <div className="skeleton-title-line skeleton-shimmer"></div>
        <div className="skeleton-text-line skeleton-shimmer"></div>
        <div className="skeleton-text-line-short skeleton-shimmer"></div>
        <div className="skeleton-price-line skeleton-shimmer"></div>
      </div>
    </div>
  );
}

// Menu loading layout skeleton (Tabs + Cards)
export function MenuSkeleton() {
  return (
    <div style={{ width: '100%', margin: '40px 0' }}>
      <div className="skeleton-category-row">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="skeleton-category-tab skeleton-shimmer"></div>
        ))}
      </div>
      <div className="skeleton-menu-grid">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <MenuCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

// Gallery items loading skeleton (Horizontal scrolling cards)
export function GallerySkeleton() {
  return (
    <div className="skeleton-gallery-container">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="skeleton-gallery-card">
          <div className="menu-image-shimmer skeleton-shimmer"></div>
          <div className="skeleton-gallery-overlay">
            <div className="skeleton-gallery-title skeleton-shimmer"></div>
            <div className="skeleton-gallery-subtitle skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hero loading spinner (replaced glimmer skeleton)
export function HeroSkeleton() {
  return (
    <div className="hero-loader-container">
      <div className="hero-loader-spinner">
        <div className="hero-loader-double-ring"></div>
        <div className="hero-loader-logo">京</div>
      </div>
      <span className="hero-loader-text">Loading Kyō-To Experience...</span>
    </div>
  );
}
