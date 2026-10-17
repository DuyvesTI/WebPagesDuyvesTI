/**
 * tests/helpers/spec_contracts.js
 * Authoritative specification contracts for DuyvesTI Features F01 to F24.
 * Derived strictly from ORIGINAL_REQUEST.md, PROJECT.md, and requirements_spec.md.
 */

const SPEC_CONTRACTS = {
  F01: {
    featureId: 'F01',
    name: 'Anti-Rental Value Prop & Hero',
    valuePropText: 'Paga una sola vez, sé el dueño total de tu web y olvídate de arriendos mensuales abusivos.',
    targetAudience: ['PyMEs', 'Startups', 'emprendedores'],
    primaryCtaText: /Cotizar|CONTÁCTAME|Empezar/i,
    secondaryCtaText: /planes|servicios/i,
    guarantees: ['0 mensualidades forzadas', '100% código tuyo', 'dominio a tu nombre']
  },

  F02: {
    featureId: 'F02',
    name: 'Accessible Color Palette & Contrast',
    wcagThresholdNormal: 4.5,
    wcagThresholdLarge: 3.0,
    darkTheme: {
      bgCanvas: '#0A0F1D',
      bgSurface: '#111827',
      textPrimary: '#F9FAFB',
      textMuted: '#9CA3AF',
      accent: '#00D2B4',
      accentOrange: '#FF6A13'
    },
    lightTheme: {
      bgCanvas: '#F8FAFC',
      bgSurface: '#FFFFFF',
      textPrimary: '#0F172A',
      textMuted: '#475569',
      accent: '#007A78',
      accentOrange: '#E55A05'
    },
    forbiddenContrastRatios: [
      { name: 'white_on_yellow', fg: '#FFFFFF', bg: '#FFC107', maxRatio: 2.0 } // Old bug: 1.63:1
    ]
  },

  F03: {
    featureId: 'F03',
    name: 'Dark/Light Theme Switcher',
    storageKey: 'duyvesti-theme',
    darkClass: 'dark',
    mediaQuery: '(prefers-color-scheme: dark)',
    antiFoucScriptRequired: true
  },

  F04: {
    featureId: 'F04',
    name: 'Sticky Accessible Navigation',
    landmarkRole: 'banner',
    navAriaLabel: 'Navegación principal',
    requiredLinks: [
      { text: 'Inicio', href: '/' },
      { text: 'Servicios', href: '#servicios' },
      { text: 'Portafolio', href: '#portafolio' },
      { text: 'Planes', href: '#planes' },
      { text: 'Contacto', href: '#contacto' }
    ],
    brandMonogram: 'DTI',
    brandName: 'DuyvesTI'
  },

  F05: {
    featureId: 'F05',
    name: 'Accessible Mobile Drawer',
    toggleSelector: '[aria-controls="mobile-menu"], button.mobile-menu-btn, button[aria-label*="menú"]',
    drawerId: 'mobile-menu',
    minTapTargetPx: 48,
    requiredAttributes: ['aria-expanded', 'aria-controls']
  },

  F06: {
    featureId: 'F06',
    name: 'Quoter Step 1 (Project Type)',
    plans: [
      { id: 'landing', minPrice: 140000, maxPrice: 190000, maxDays: 5 },
      { id: 'corporate', minPrice: 290000, maxPrice: 330000, maxDays: 10 },
      { id: 'custom', minPrice: 480000, maxPrice: 600000, maxDays: 20 }
    ]
  },

  F07: {
    featureId: 'F07',
    name: 'Quoter Step 2 (Modular Addons)',
    allowedAddons: [
      { id: 'whatsapp_crm', minPrice: 30000, maxPrice: 40000 },
      { id: 'payment_gateway', minPrice: 70000, maxPrice: 80000 },
      { id: 'seo_local', minPrice: 40000, maxPrice: 50000 },
      { id: 'catalog', minPrice: 50000, maxPrice: 65000 },
      { id: 'support_pack', minPrice: 25000, maxPrice: 35000 }
    ]
  },

  F08: {
    featureId: 'F08',
    name: 'Quoter Step 3 (Summary & Transfer)',
    splitPercentage: [50, 50],
    customEventName: 'duyvesti:quote-selected',
    whatsAppUrlPattern: /^https:\/\/wa\.me\/569\d{8}\?text=.+/
  },

  F09: {
    featureId: 'F09',
    name: 'Reactive Contact Form',
    requiredFields: ['name', 'email', 'phone', 'message'],
    optionalFields: ['company', 'plan'],
    formId: 'contact-form'
  },

  F10: {
    featureId: 'F10',
    name: 'Instant Form Validation',
    chileanPhonePrefix: '+56 9',
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ariaInvalidRequired: true
  },

  F11: {
    featureId: 'F11',
    name: 'LocalStorage Draft Backup',
    draftKey: 'duyvesti_form_draft_v1',
    debounceMs: 300,
    notificationText: /recuperamos tu cotización/i
  },

  F12: {
    featureId: 'F12',
    name: 'Reactive Form Submission Flow',
    slaTimeText: /2 horas hábiles/i,
    whatsappFallback: true
  },

  F13: {
    featureId: 'F13',
    name: 'PyME-Oriented Services Grid',
    minCards: 4,
    forbiddenJargon: ['microservicios', 'kubernetes', 'ci/cd', 'docker container', 'terraform']
  },

  F14: {
    featureId: 'F14',
    name: '"Método DuyvesTI" Process',
    stagesCount: 4,
    stages: ['Descubrimiento', 'Diseño', 'Llave en Mano', 'Lanzamiento']
  },

  F15: {
    featureId: 'F15',
    name: 'Commercial Portfolio Showcases',
    minCases: 3,
    businessMetricsRequired: true
  },

  F16: {
    featureId: 'F16',
    name: '3-Tier Transparent Pricing',
    tiersCount: 3,
    zeroMonthlyRentStated: true
  },

  F17: {
    featureId: 'F17',
    name: 'Accessible FAQ Accordion',
    minQuestions: 5,
    requiredAria: ['aria-expanded', 'aria-controls']
  },

  F18: {
    featureId: 'F18',
    name: 'WhatsApp FAB & Direct Contact',
    fabSelector: 'a[href*="wa.me"]',
    fixedPosition: true
  },

  F19: {
    featureId: 'F19',
    name: 'Schema.org Structured Data',
    requiredSchemas: ['ProfessionalService', 'FAQPage'],
    currency: 'CLP',
    country: 'CL'
  },

  F20: {
    featureId: 'F20',
    name: 'LCP & Performance Optimization',
    lcpThresholdSec: 1.2,
    lighthouseTarget: 95
  },

  F21: {
    featureId: 'F21',
    name: 'Security HTTP Headers (Grade A+)',
    requiredHeaders: [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Content-Security-Policy'
    ]
  },

  F22: {
    featureId: 'F22',
    name: 'Anti-Spam & Bot Defense Engine',
    honeypotField: 'organization_fax_hp',
    minSubmissionDeltaMs: 2500
  },

  F23: {
    featureId: 'F23',
    name: 'Plain-Language Privacy Policy',
    legalReference: 'Ley 19.628',
    arcoRights: ['Acceso', 'Rectificación', 'Cancelación', 'Oposición'],
    cookieDisclosure: true
  },

  F24: {
    featureId: 'F24',
    name: 'Cross-Browser & Multi-Device QA',
    viewports: [
      { name: 'Mobile Compact', width: 360, height: 640 },
      { name: 'Mobile Standard', width: 390, height: 844 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop Standard', width: 1280, height: 800 },
      { name: 'Desktop FHD', width: 1920, height: 1080 }
    ],
    zeroConsoleErrors: true
  }
};

module.exports = {
  SPEC_CONTRACTS
};
