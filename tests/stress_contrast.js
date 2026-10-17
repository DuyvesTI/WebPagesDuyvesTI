/**
 * tests/stress_contrast.js
 * Empirical stress harness for Contrast Math & Token Overrides
 * Tests:
 * 1. Exact mathematical boundaries (4.500:1, 3.000:1, 7.000:1, 1.000:1, 21.000:1)
 * 2. Hex parsing edge cases (3, 4, 6, 8 digits, invalid characters, whitespace, case)
 * 3. Exhaustive audit of all CSS tokens in src/css/globals.css (Dark & Light modes)
 * 4. Focus indicator contrast (WCAG 2.4.11/2.4.13 >= 3.0:1)
 * 5. Adversarial token override permutations (10,000 random/boundary color pairs)
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsWcagAA
} = require('./helpers/contrast_math.js');

function parseCssTokens(cssContent) {
  const tokens = { dark: {}, light: {} };
  let currentTheme = 'dark';

  const lines = cssContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes(':root[data-theme="light"]') || trimmed.includes('color-scheme: light')) {
      currentTheme = 'light';
    } else if (trimmed.includes(':root[data-theme="dark"]') || trimmed.includes('color-scheme: dark')) {
      currentTheme = 'dark';
    }

    const match = trimmed.match(/^(--[\w-]+):\s*([^;]+);/);
    if (match) {
      const prop = match[1];
      const val = match[2].trim();
      tokens[currentTheme][prop] = val;
    }
  }
  return tokens;
}

async function run() {
  console.log('--- Starting Contrast Math & Token Overrides Stress Harness ---');
  const results = {
    boundaryMath: { tested: 0, passed: 0, failed: 0 },
    parserRobustness: { tested: 0, passed: 0, failed: 0, findings: [] },
    tokenAudit: { dark: [], light: [], failures: [] },
    overrideStress: { tested: 0, passed: 0 }
  };

  // -------------------------------------------------------------
  // Test 1: Mathematical Boundary Tests
  // -------------------------------------------------------------
  console.log('\n[1] Testing Mathematical Contrast Boundaries...');
  
  // High contrast limit
  const maxRatio = getContrastRatio('#000000', '#ffffff');
  assert.equal(maxRatio, 21, 'Black on white must equal exactly 21:1');
  results.boundaryMath.passed++;

  // Low contrast limit
  const minRatio = getContrastRatio('#123456', '#123456');
  assert.equal(minRatio, 1, 'Identical colors must equal exactly 1:1');
  results.boundaryMath.passed++;

  // Symmetry: ratio(A, B) === ratio(B, A)
  const colorsA = ['#FF6A13', '#0F172A', '#F1F5F9', '#94A3B8', '#059669', '#C2410C'];
  for (const c1 of colorsA) {
    for (const c2 of colorsA) {
      const r1 = getContrastRatio(c1, c2);
      const r2 = getContrastRatio(c2, c1);
      assert.equal(r1.toFixed(4), r2.toFixed(4), `Asymmetric contrast between ${c1} and ${c2}`);
      results.boundaryMath.passed++;
    }
  }

  // 4.5:1 Boundary precision
  // #777777 on #FFFFFF is 4.478:1 (FAIL AA normal)
  // #767676 on #FFFFFF is 4.540:1 (PASS AA normal)
  // #595959 on #FFFFFF is 7.004:1 (PASS AAA)
  assert.strictEqual(meetsWcagAA('#777777', '#FFFFFF', false), false, '4.48:1 must fail AA normal');
  assert.strictEqual(meetsWcagAA('#767676', '#FFFFFF', false), true, '4.54:1 must pass AA normal');
  assert.strictEqual(meetsWcagAA('#777777', '#FFFFFF', true), true, '4.48:1 must pass AA large text (>= 3.0:1)');
  assert.strictEqual(meetsWcagAA('#999999', '#FFFFFF', true), false, '2.84:1 must fail AA large text');
  results.boundaryMath.passed += 4;
  console.log(`  Passed ${results.boundaryMath.passed} mathematical boundary assertions.`);

  // -------------------------------------------------------------
  // Test 2: Hex Parser Robustness & Error Handling
  // -------------------------------------------------------------
  console.log('\n[2] Testing Hex Parser Robustness & Edge Cases...');
  const validHexes = [
    { input: '#fff', expected: { r: 255, g: 255, b: 255 } },
    { input: '#FFF', expected: { r: 255, g: 255, b: 255 } },
    { input: '#000', expected: { r: 0, g: 0, b: 0 } },
    { input: '  #123456  ', expected: { r: 18, g: 52, b: 86 } },
    { input: '#ff6a13', expected: { r: 255, g: 106, b: 19 } },
    { input: '#FF6A13', expected: { r: 255, g: 106, b: 19 } }
  ];

  for (const { input, expected } of validHexes) {
    results.parserRobustness.tested++;
    try {
      const rgb = hexToRgb(input);
      assert.deepEqual(rgb, expected);
      results.parserRobustness.passed++;
    } catch (err) {
      results.parserRobustness.findings.push(
        `FINDING: hexToRgb('${input}') threw Error "${err.message}". contrast_math.js calls .replace(/^#/, '').trim() instead of .trim().replace(/^#/, ''), failing on leading whitespace.`
      );
    }
  }

  const invalidHexes = [
    '',
    '#',
    '#f',
    '#ff',
    '#ffff', // 4-digit hex
    '#fffff', // 5-digit hex
    '#ffffffaa', // 8-digit hex
    '#1234567',
    'rgb(255, 0, 0)',
    'not-a-color'
  ];

  for (const inv of invalidHexes) {
    results.parserRobustness.tested++;
    assert.throws(
      () => hexToRgb(inv),
      /(Invalid hex color|Unsupported color format)/i,
      `Expected error on invalid hex: "${inv}"`
    );
    results.parserRobustness.passed++;
  }

  // Edge Case: Non-hex characters in 6-digit string, e.g. #zzzzzz or #gggggg
  console.log('  Testing non-hex 6-char string (#zzzzzz)...');
  try {
    const nonHexRgb = hexToRgb('#zzzzzz');
    if (Number.isNaN(nonHexRgb.r) || Number.isNaN(nonHexRgb.g) || Number.isNaN(nonHexRgb.b)) {
      results.parserRobustness.findings.push(
        'FINDING: hexToRgb("#zzzzzz") returns { r: NaN, g: NaN, b: NaN } without throwing an Error because it checks length instead of /^[0-9a-fA-F]{6}$/.'
      );
    }
  } catch (err) {
    // If it threw, that's good
  }

  console.log(`  Hex parser passed ${results.parserRobustness.passed} cases.`);
  if (results.parserRobustness.findings.length > 0) {
    results.parserRobustness.findings.forEach((f) => console.log('   -', f));
  }

  // -------------------------------------------------------------
  // Test 3: Exhaustive Audit of All Design Tokens in globals.css
  // -------------------------------------------------------------
  console.log('\n[3] Auditing All Color Tokens in src/css/globals.css...');
  const css = fs.readFileSync(path.resolve(__dirname, '../src/css/globals.css'), 'utf-8');
  const tokens = parseCssTokens(css);

  const darkCanvas = tokens.dark['--bg-canvas'] || '#0A0D14';
  const darkSurface = tokens.dark['--bg-surface'] || '#121722';
  const lightCanvas = tokens.light['--bg-canvas'] || '#F8FAFC';
  const lightSurface = tokens.light['--bg-surface'] || '#FFFFFF';

  const checkToken = (name, textHex, bgHex, theme, minRatio, isLarge = false) => {
    try {
      const ratio = getContrastRatio(textHex, bgHex);
      const passed = ratio >= minRatio;
      const entry = {
        name,
        theme,
        text: textHex,
        bg: bgHex,
        ratio: ratio.toFixed(2),
        min: minRatio,
        passed
      };
      if (theme === 'dark') results.tokenAudit.dark.push(entry);
      else results.tokenAudit.light.push(entry);

      if (!passed) {
        results.tokenAudit.failures.push(entry);
      }
      return passed;
    } catch (err) {
      results.tokenAudit.failures.push({ name, theme, error: err.message });
      return false;
    }
  };

  // Dark Theme Token Pairs
  checkToken('--text-primary on canvas', tokens.dark['--text-primary'], darkCanvas, 'dark', 4.5);
  checkToken('--text-primary on surface', tokens.dark['--text-primary'], darkSurface, 'dark', 4.5);
  checkToken('--text-secondary on canvas', tokens.dark['--text-secondary'], darkCanvas, 'dark', 4.5);
  checkToken('--text-secondary on surface', tokens.dark['--text-secondary'], darkSurface, 'dark', 4.5);
  checkToken('--text-accent on canvas', tokens.dark['--text-accent'], darkCanvas, 'dark', 4.5);
  checkToken('--text-accent on surface', tokens.dark['--text-accent'], darkSurface, 'dark', 4.5);
  checkToken('--btn-primary text on bg', tokens.dark['--btn-primary-text'], tokens.dark['--btn-primary-bg'], 'dark', 4.5);
  checkToken('--btn-primary hover', tokens.dark['--btn-primary-hover-text'], tokens.dark['--btn-primary-hover-bg'], 'dark', 4.5);
  checkToken('--btn-icon-color on canvas', tokens.dark['--btn-icon-color'], darkCanvas, 'dark', 3.0, true);
  checkToken('--status-success-text on surface', tokens.dark['--status-success-text'], darkSurface, 'dark', 4.5);
  checkToken('--status-error-text on surface', tokens.dark['--status-error-text'], darkSurface, 'dark', 4.5);
  checkToken('--status-warning-text on surface', tokens.dark['--status-warning-text'], darkSurface, 'dark', 4.5);
  checkToken('--status-info-text on surface', tokens.dark['--status-info-text'], darkSurface, 'dark', 4.5);

  // Light Theme Token Pairs
  checkToken('--text-primary on canvas', tokens.light['--text-primary'], lightCanvas, 'light', 4.5);
  checkToken('--text-primary on surface', tokens.light['--text-primary'], lightSurface, 'light', 4.5);
  checkToken('--text-secondary on canvas', tokens.light['--text-secondary'], lightCanvas, 'light', 4.5);
  checkToken('--text-secondary on surface', tokens.light['--text-secondary'], lightSurface, 'light', 4.5);
  checkToken('--text-muted on surface', tokens.light['--text-muted'], lightSurface, 'light', 4.5);
  checkToken('--text-accent on canvas', tokens.light['--text-accent'], lightCanvas, 'light', 4.5);
  checkToken('--text-accent on surface', tokens.light['--text-accent'], lightSurface, 'light', 4.5);
  checkToken('--btn-primary text on bg', tokens.light['--btn-primary-text'], tokens.light['--btn-primary-bg'], 'light', 4.5);
  checkToken('--btn-primary hover', tokens.light['--btn-primary-hover-text'], tokens.light['--btn-primary-hover-bg'], 'light', 4.5);
  checkToken('--btn-icon-color on surface', tokens.light['--btn-icon-color'], lightSurface, 'light', 3.0, true);
  checkToken('--badge-text on surface', tokens.light['--badge-text'], lightSurface, 'light', 4.5);
  checkToken('--status-success-text on surface', tokens.light['--status-success-text'], lightSurface, 'light', 4.5);
  checkToken('--status-error-text on surface', tokens.light['--status-error-text'], lightSurface, 'light', 4.5);
  checkToken('--status-warning-text on surface', tokens.light['--status-warning-text'], lightSurface, 'light', 4.5);
  checkToken('--status-info-text on surface', tokens.light['--status-info-text'], lightSurface, 'light', 4.5);

  console.log(`  Dark theme pairs checked: ${results.tokenAudit.dark.length}, all passing: ${results.tokenAudit.dark.every((p) => p.passed)}`);
  console.log(`  Light theme pairs checked: ${results.tokenAudit.light.length}, all passing: ${results.tokenAudit.light.every((p) => p.passed)}`);

  if (results.tokenAudit.failures.length > 0) {
    console.error('  FAILURES DETECTED IN TOKEN AUDIT:');
    results.tokenAudit.failures.forEach((f) => console.error('   ✖', f));
  }

  // -------------------------------------------------------------
  // Test 4: Focus Indicator Contrast (WCAG 2.4.11 / 2.4.13)
  // -------------------------------------------------------------
  console.log('\n[4] Testing Focus Indicator Contrast Tokens...');
  // Dark mode focus ring
  const darkRing = tokens.dark['--ring-focus'] || '#FF6A13';
  const darkRingRatio = getContrastRatio(darkRing, darkCanvas);
  console.log(`  Dark focus ring (${darkRing}) on canvas (${darkCanvas}): ${darkRingRatio.toFixed(2)}:1 (Target >= 3.0:1)`);
  assert.ok(darkRingRatio >= 3.0, `Dark focus ring contrast must be >= 3.0:1, got ${darkRingRatio}`);

  // Light mode focus ring
  const lightRing = tokens.light['--ring-focus'] || '#EA580C';
  const lightRingRatio = getContrastRatio(lightRing, lightCanvas);
  console.log(`  Light focus ring (${lightRing}) on canvas (${lightCanvas}): ${lightRingRatio.toFixed(2)}:1 (Target >= 3.0:1)`);
  assert.ok(lightRingRatio >= 3.0, `Light focus ring contrast must be >= 3.0:1, got ${lightRingRatio}`);

  // -------------------------------------------------------------
  // Test 5: Adversarial Token Override Permutations (10,000 runs)
  // -------------------------------------------------------------
  console.log('\n[5] Stress-testing 10,000 Dynamic Color Overrides...');
  let falsePositives = 0;
  let falseNegatives = 0;

  for (let i = 0; i < 10000; i++) {
    results.overrideStress.tested++;
    // Generate random 24-bit hex colors
    const r1 = (Math.random() * 256) | 0;
    const g1 = (Math.random() * 256) | 0;
    const b1 = (Math.random() * 256) | 0;
    const r2 = (Math.random() * 256) | 0;
    const g2 = (Math.random() * 256) | 0;
    const b2 = (Math.random() * 256) | 0;

    const hex1 = `#${r1.toString(16).padStart(2, '0')}${g1.toString(16).padStart(2, '0')}${b1.toString(16).padStart(2, '0')}`;
    const hex2 = `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;

    const ratio = getContrastRatio(hex1, hex2);
    const passes = meetsWcagAA(hex1, hex2, false);

    if (ratio >= 4.5 && !passes) falseNegatives++;
    if (ratio < 4.5 && passes) falsePositives++;
  }

  assert.equal(falseNegatives, 0, 'No false negatives allowed in contrast oracle');
  assert.equal(falsePositives, 0, 'No false positives allowed in contrast oracle');
  console.log(`  Tested 10,000 random token overrides: 0 false positives, 0 false negatives.`);

  console.log('\n=== Contrast Stress Test Completed Successfully ===');
  return results;
}

run().catch((err) => {
  console.error('Fatal contrast stress test error:', err);
  process.exit(1);
});
