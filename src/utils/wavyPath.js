/**
 * Generates the same round-wavy SVG path used in the hero section bottom cutout.
 * Quadratic bezier curves with sin/cos wiggle for organic feel.
 *
 * @param {object} opts
 * @param {number} opts.width     — viewBox width (default 1440)
 * @param {number} opts.waveCount — number of wiggle segments (default 36)
 * @param {number} opts.wiggleAmp — amplitude of wiggles (default 5)
 * @param {number} opts.curveDepth — how deep the curve dips (default 155, higher = deeper)
 * @param {number} opts.baseY     — baseline Y of curve ends (default 65)
 * @param {number} opts.floorY    — the bottom of the fill shape (default 120)
 * @returns {string} SVG path `d` attribute
 */
export function generateRoundWavyPath({
  width = 1440,
  waveCount = 36,
  wiggleAmp = 5,
  curveDepth = 155,
  baseY = 65,
  floorY = 120,
} = {}) {
  const step = width / waveCount;
  const P0_y = baseY;
  const P1_y = curveDepth;
  const P2_y = baseY;

  const getCurveY = (t) =>
    (1 - t) * (1 - t) * P0_y + 2 * (1 - t) * t * P1_y + t * t * P2_y;

  let path = `M${width},${floorY} L${width},${P2_y}`;

  for (let i = waveCount; i > 0; i--) {
    const x1 = i * step;
    const x2 = (i - 1) * step;
    const midX = (x1 + x2) / 2;
    const tMid = ((i / waveCount) + ((i - 1) / waveCount)) / 2;
    const y2 = getCurveY((i - 1) / waveCount);
    const wiggle = wiggleAmp * Math.sin(i * 1.5) + (wiggleAmp / 2) * Math.cos(i * 2.7);
    const controlY = getCurveY(tMid) + wiggle;
    path += ` Q${midX},${controlY} ${x2},${y2}`;
  }

  path += ` L0,${floorY} Z`;
  return path;
}
