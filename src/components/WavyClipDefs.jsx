import { useMemo } from 'react';

/**
 * WavyClipDefs — Shared SVG <clipPath> definitions used site-wide.
 *
 * Generates a wavy card clip-path using the SAME wiggle formula as the
 * hero section (quadratic bezier curves with sin/cos wiggle amplitude),
 * applied to all 4 sides of a rectangle.
 *
 * Usage in CSS:  clip-path: url(#wavy-card-clip);
 *
 * clipPathUnits="objectBoundingBox" means all coordinates are 0–1
 * (percentage of the element's bounding box), so it scales to any card size.
 */
export default function WavyClipDefs() {
  const wavyPath = useMemo(() => generateWavyCardPath(18, 0.005, 0.005), []);
  const wavyFounderPath = useMemo(() => generateWavyCardPath(18, 0.004, 0.0015), []);

  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="wavy-card-clip" clipPathUnits="objectBoundingBox">
          <path d={wavyPath} />
        </clipPath>
        <clipPath id="wavy-founder-clip" clipPathUnits="objectBoundingBox">
          <path d={wavyFounderPath} />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Generates a wavy rectangle path using the same wiggle algorithm as the
 * hero section: Q (quadratic bezier) curves with
 *   wiggle = wiggleAmp * Math.sin(i * 1.5) + (wiggleAmp/2) * Math.cos(i * 2.7)
 *
 * All coordinates are in 0–1 range for objectBoundingBox usage.
 */
function generateWavyCardPath(waveCount = 18, wiggleAmpX = 0.005, wiggleAmpY = 0.005) {
  const step = 1 / waveCount;

  // Wiggle offset at segment i — mirrors the hero formula exactly
  const getWiggleX = (i) =>
    wiggleAmpX * Math.sin(i * 1.5) + (wiggleAmpX / 2) * Math.cos(i * 2.7);

  const getWiggleY = (i) =>
    wiggleAmpY * Math.sin(i * 1.5) + (wiggleAmpY / 2) * Math.cos(i * 2.7);

  let d = '';

  // --- Top edge: left → right (y wiggles around 0) ---
  d += `M 0,${fmt(0 + getWiggleY(0))}`;
  for (let i = 0; i < waveCount; i++) {
    const x1 = i * step;
    const x2 = (i + 1) * step;
    const midX = (x1 + x2) / 2;
    const controlY = 0 + getWiggleY(i + 0.5);
    const endY = 0 + getWiggleY(i + 1);
    d += ` Q ${fmt(midX)},${fmt(controlY)} ${fmt(x2)},${fmt(endY)}`;
  }

  // --- Right edge: top → bottom (x wiggles around 1) ---
  for (let i = 0; i < waveCount; i++) {
    const y1 = i * step;
    const y2 = (i + 1) * step;
    const midY = (y1 + y2) / 2;
    const controlX = 1 + getWiggleX(i + waveCount + 0.5);
    const endX = 1 + getWiggleX(i + waveCount + 1);
    d += ` Q ${fmt(controlX)},${fmt(midY)} ${fmt(endX)},${fmt(y2)}`;
  }

  // --- Bottom edge: right → left (y wiggles around 1) ---
  for (let i = 0; i < waveCount; i++) {
    const x1 = 1 - i * step;
    const x2 = 1 - (i + 1) * step;
    const midX = (x1 + x2) / 2;
    const controlY = 1 + getWiggleY(i + waveCount * 2 + 0.5);
    const endY = 1 + getWiggleY(i + waveCount * 2 + 1);
    d += ` Q ${fmt(midX)},${fmt(controlY)} ${fmt(x2)},${fmt(endY)}`;
  }

  // --- Left edge: bottom → top (x wiggles around 0) ---
  for (let i = 0; i < waveCount; i++) {
    const y1 = 1 - i * step;
    const y2 = 1 - (i + 1) * step;
    const midY = (y1 + y2) / 2;
    const controlX = 0 + getWiggleX(i + waveCount * 3 + 0.5);
    const endX = 0 + getWiggleX(i + waveCount * 3 + 1);
    d += ` Q ${fmt(controlX)},${fmt(midY)} ${fmt(endX)},${fmt(y2)}`;
  }

  d += ' Z';
  return d;
}

/** Format number to 5 decimal places to keep the path compact */
function fmt(n) {
  return n.toFixed(5);
}
