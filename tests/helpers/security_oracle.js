/**
 * tests/helpers/security_oracle.js
 * Authoritative Security headers, XSS sanitization, and bot defense rules.
 */

const EXPECTED_SECURITY_HEADERS = {
  'strict-transport-security': {
    required: true,
    pattern: /max-age=\d+;\s*includeSubDomains/i,
    description: 'Enforces HTTPS and preload protection'
  },
  'x-content-type-options': {
    required: true,
    expected: 'nosniff',
    description: 'Prevents MIME-sniffing attacks'
  },
  'x-frame-options': {
    required: true,
    expected: 'DENY',
    description: 'Prevents clickjacking framing'
  },
  'referrer-policy': {
    required: true,
    pattern: /(strict-origin-when-cross-origin|no-referrer|strict-origin)/i,
    description: 'Prevents referrer leakage'
  },
  'permissions-policy': {
    required: true,
    pattern: /(camera=\(\)|microphone=\(\)|geolocation=\(\))/i,
    description: 'Restricts dangerous browser APIs'
  },
  'content-security-policy': {
    required: true,
    pattern: /default-src\s+'self'/i,
    description: 'Restricts resource loading origins'
  }
};

function verifySecurityHeaders(headers = {}) {
  const normalized = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }

  const results = {
    allPassed: true,
    checks: {},
    grade: 'A+'
  };

  let missingCount = 0;

  for (const [headerName, spec] of Object.entries(EXPECTED_SECURITY_HEADERS)) {
    const value = normalized[headerName];
    const check = {
      header: headerName,
      present: !!value,
      value: value || null,
      passed: false,
      reason: null
    };

    if (!value) {
      check.reason = 'Header is missing';
      missingCount++;
      results.allPassed = false;
    } else if (spec.expected && value.toUpperCase() !== spec.expected.toUpperCase()) {
      check.reason = `Expected "${spec.expected}", got "${value}"`;
      missingCount++;
      results.allPassed = false;
    } else if (spec.pattern && !spec.pattern.test(value)) {
      check.reason = `Value "${value}" does not match required pattern ${spec.pattern}`;
      missingCount++;
      results.allPassed = false;
    } else {
      check.passed = true;
    }

    results.checks[headerName] = check;
  }

  if (missingCount > 2) results.grade = 'F';
  else if (missingCount === 2) results.grade = 'C';
  else if (missingCount === 1) results.grade = 'B';
  else results.grade = 'A+';

  return results;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Strip dangerous HTML tags and script elements
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function isMaliciousInput(input) {
  if (typeof input !== 'string') return false;
  const attackPatterns = [
    /<script/i,
    /<\/script>/i,
    /<iframe/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /eval\s*\(/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /'\s*OR\s*'1'='1/i,
    /--/
  ];
  return attackPatterns.some(pat => pat.test(input));
}

module.exports = {
  EXPECTED_SECURITY_HEADERS,
  verifySecurityHeaders,
  sanitizeInput,
  isMaliciousInput
};
