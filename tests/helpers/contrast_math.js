/**
 * tests/helpers/contrast_math.js
 * Authoritative WCAG 2.1 relative luminance and contrast ratio engine.
 */

function hexToRgb(hex) {
  let cleaned = hex.replace(/^#/, '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

function parseRgbString(rgbStr) {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) throw new Error(`Cannot parse RGB string: ${rgbStr}`);
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
}

function normalizeColor(color) {
  if (typeof color === 'string') {
    if (color.startsWith('#')) return hexToRgb(color);
    if (color.startsWith('rgb')) return parseRgbString(color);
  } else if (typeof color === 'object' && color !== null && 'r' in color && 'g' in color && 'b' in color) {
    return color;
  }
  throw new Error(`Unsupported color format: ${color}`);
}

function getRelativeLuminance(color) {
  const { r, g, b } = normalizeColor(color);

  const adjust = (c8) => {
    const s = c8 / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const rLin = adjust(r);
  const gLin = adjust(g);
  const bLin = adjust(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function getContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWcagAA(color1, color2, isLargeText = false) {
  const ratio = getContrastRatio(color1, color2);
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold;
}

module.exports = {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsWcagAA
};
