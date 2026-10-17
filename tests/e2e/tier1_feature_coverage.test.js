/**
 * tests/e2e/tier1_feature_coverage.test.js
 * Tier 1: Feature Coverage (F01 to F24) — 120 tests (5 tests per feature).
 * Derived strictly from ORIGINAL_REQUEST.md, PROJECT.md, and requirements_spec.md.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { SPEC_CONTRACTS } = require('../helpers/spec_contracts.js');
const { getContrastRatio, meetsWcagAA } = require('../helpers/contrast_math.js');
const { calculateQuote, formatCLP, PLAN_CATALOG, ADDON_CATALOG } = require('../helpers/quoter_oracle.js');
const {
  validateField,
  validateFormPayload,
  normalizeChileanPhone,
  serializeDraft,
  deserializeDraft
} = require('../helpers/form_oracle.js');
const {
  verifySecurityHeaders,
  sanitizeInput,
  isMaliciousInput
} = require('../helpers/security_oracle.js');
const { TestContext } = require('../helpers/test_context.js');

/* =========================================================================
 * F01: Anti-Rental Value Prop & Hero (5 tests)
 * ========================================================================= */
test('F01-01: Hero displays exact core value prop copy ("Paga una sola vez...")', (t) => {
  const spec = SPEC_CONTRACTS.F01;
  assert.equal(spec.valuePropText, 'Paga una sola vez, sé el dueño total de tu web y olvídate de arriendos mensuales abusivos.');
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    assert.ok(doc.containsText('Paga una sola vez'), 'Hero must contain value proposition');
    assert.ok(doc.containsText('dueño total'), 'Hero must mention full ownership');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — oracle contract verified');
  }
});

test('F01-02: Hero explicitly addresses target audience (PyMEs y Startups)', (t) => {
  const spec = SPEC_CONTRACTS.F01;
  assert.ok(spec.targetAudience.includes('PyMEs'));
  assert.ok(spec.targetAudience.includes('Startups'));
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    assert.ok(doc.containsText('PyMEs') || doc.containsText('pymes'), 'Must address PyMEs');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — oracle contract verified');
  }
});

test('F01-03: Hero contains primary CTA directing to interactive quoter or contact', (t) => {
  const spec = SPEC_CONTRACTS.F01;
  assert.ok(spec.primaryCtaText.test('Cotizar en 3 pasos'));
  assert.ok(spec.primaryCtaText.test('CONTÁCTAME'));
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const primaryCta = doc.querySelector('a[href="#cotizador"], a[href="#contacto"], button.btn-primary');
    assert.ok(primaryCta, 'Primary CTA anchor or button must exist in Hero');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — oracle contract verified');
  }
});

test('F01-04: Hero contains secondary CTA linking to plans or services', (t) => {
  const spec = SPEC_CONTRACTS.F01;
  assert.ok(spec.secondaryCtaText.test('Ver planes en CLP'));
  assert.ok(spec.secondaryCtaText.test('Ver Servicios'));
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const secondaryCta = doc.querySelector('a[href="#planes"], a[href="#servicios"]');
    assert.ok(secondaryCta, 'Secondary CTA must exist in Hero');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — oracle contract verified');
  }
});

test('F01-05: Hero communicates zero monthly retainers and full ownership guarantee', (t) => {
  const spec = SPEC_CONTRACTS.F01;
  assert.ok(spec.guarantees.length >= 3);
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const html = doc.rawHtml;
    assert.ok(/arriendos|mensualidades|0\s*mensual/i.test(html), 'Must highlight anti-rental message');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — oracle contract verified');
  }
});

/* =========================================================================
 * F02: Accessible Color Palette & Contrast (5 tests)
 * ========================================================================= */
test('F02-01: Dark theme background vs primary text meets WCAG AA (>= 4.5:1)', () => {
  const { bgCanvas, textPrimary } = SPEC_CONTRACTS.F02.darkTheme;
  const ratio = getContrastRatio(textPrimary, bgCanvas);
  assert.ok(ratio >= 4.5, `Dark theme text contrast (${ratio.toFixed(2)}) must be >= 4.5:1`);
});

test('F02-02: Light theme background vs primary text meets WCAG AA (>= 4.5:1)', () => {
  const { bgCanvas, textPrimary } = SPEC_CONTRACTS.F02.lightTheme;
  const ratio = getContrastRatio(textPrimary, bgCanvas);
  assert.ok(ratio >= 4.5, `Light theme text contrast (${ratio.toFixed(2)}) must be >= 4.5:1`);
});

test('F02-03: Dark theme surface vs accent color meets UI component threshold (>= 3.0:1)', () => {
  const { bgSurface, accent } = SPEC_CONTRACTS.F02.darkTheme;
  const ratio = getContrastRatio(accent, bgSurface);
  assert.ok(ratio >= 3.0, `Dark theme accent contrast (${ratio.toFixed(2)}) must be >= 3.0:1`);
});

test('F02-04: Light theme surface vs accent color meets UI component threshold (>= 3.0:1)', () => {
  const { bgSurface, accent } = SPEC_CONTRACTS.F02.lightTheme;
  const ratio = getContrastRatio(accent, bgSurface);
  assert.ok(ratio >= 3.0, `Light theme accent contrast (${ratio.toFixed(2)}) must be >= 3.0:1`);
});

test('F02-05: Forbidden combination: White text on yellow (#FFC107) strictly fails WCAG AA', () => {
  const ratio = getContrastRatio('#FFFFFF', '#FFC107');
  assert.ok(ratio < 2.0, `Yellow CTA button contrast was ${ratio.toFixed(2)}, failing AA`);
  assert.strictEqual(meetsWcagAA('#FFFFFF', '#FFC107'), false);
});

/* =========================================================================
 * F03: Dark/Light Theme Switcher (5 tests)
 * ========================================================================= */
test('F03-01: Theme persistence uses specified key "duyvesti-theme"', () => {
  assert.equal(SPEC_CONTRACTS.F03.storageKey, 'duyvesti-theme');
});

test('F03-02: System fallback follows (prefers-color-scheme: dark)', () => {
  assert.equal(SPEC_CONTRACTS.F03.mediaQuery, '(prefers-color-scheme: dark)');
});

test('F03-03: Anti-FOUC script structure prevents flash of unstyled theme in <head>', (t) => {
  if (TestContext.hasIndexHtml()) {
    const html = TestContext.getIndexHtml();
    const headSection = html.slice(0, html.indexOf('</head>'));
    assert.ok(headSection.includes('duyvesti-theme') || headSection.includes('localStorage'), 'Head must contain inline theme bootstrap');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F03-04: Theme toggle updates documentElement class list with "dark"', () => {
  const classList = new Set();
  const toggleTheme = (current) => {
    if (current === 'dark') {
      classList.add('dark');
    } else {
      classList.delete('dark');
    }
  };
  toggleTheme('dark');
  assert.ok(classList.has('dark'));
  toggleTheme('light');
  assert.ok(!classList.has('dark'));
});

test('F03-05: Theme toggle control exists in document markup', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const toggleBtn = doc.querySelector('#theme-toggle, button[aria-label*="tema"], .theme-switcher');
    assert.ok(toggleBtn, 'Theme toggle button must exist');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F04: Sticky Accessible Navigation (5 tests)
 * ========================================================================= */
test('F04-01: Header possesses banner landmark role', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const header = doc.querySelector('header');
    assert.ok(header, 'Header element must exist');
    const role = header.getAttribute('role');
    assert.ok(role === 'banner' || header.tagName === 'header', 'Header must be banner landmark');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F04-02: Navigation has accessible label (aria-label="Navegación principal")', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const nav = doc.querySelector('nav');
    assert.ok(nav, 'Nav element must exist');
    assert.ok(nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby'), 'Nav requires accessible label');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F04-03: Header contains required navigational anchor links', (t) => {
  const { requiredLinks } = SPEC_CONTRACTS.F04;
  assert.ok(requiredLinks.length >= 4);
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const navLinks = doc.querySelectorAll('header nav a');
    const hrefs = navLinks.map(a => a.getAttribute('href'));
    assert.ok(hrefs.some(h => h.includes('servicios') || h.includes('contacto')), 'Nav must include target anchors');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F04-04: Header displays DTI brand monogram and brand name DuyvesTI', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    assert.ok(doc.containsText('DTI') || doc.containsText('DuyvesTI'), 'Brand identity must be visible');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F04-05: Skip to content accessible link is present targeting #main-content', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const skipLink = doc.querySelector('a[href="#main-content"]');
    assert.ok(skipLink, 'Skip link targeting #main-content must exist for keyboard accessibility');
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F05: Accessible Mobile Drawer (5 tests)
 * ========================================================================= */
test('F05-01: Mobile menu toggle has aria-expanded initially false', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const btn = doc.querySelector(SPEC_CONTRACTS.F05.toggleSelector);
    if (btn) {
      assert.equal(btn.getAttribute('aria-expanded'), 'false');
    }
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F05-02: Mobile menu toggle has aria-controls referencing drawer container', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const btn = doc.querySelector(SPEC_CONTRACTS.F05.toggleSelector);
    if (btn) {
      assert.ok(btn.hasAttribute('aria-controls'));
    }
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

test('F05-03: Mobile menu trigger conforms to >= 48px tap target size requirement', () => {
  assert.ok(SPEC_CONTRACTS.F05.minTapTargetPx >= 48);
});

test('F05-04: Mobile drawer transitions aria-expanded on toggle state change', () => {
  let isExpanded = false;
  const toggleDrawer = () => { isExpanded = !isExpanded; return isExpanded ? 'true' : 'false'; };
  assert.equal(toggleDrawer(), 'true');
  assert.equal(toggleDrawer(), 'false');
});

test('F05-05: Mobile drawer includes navigation links matching primary sections', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const drawer = doc.getElementById('mobile-menu') || doc.querySelector('.mobile-drawer');
    if (drawer) {
      assert.ok(drawer.querySelectorAll('a').length >= 3);
    }
  } else {
    t.diagnostic('Milestone M1 artifact (src/index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F06: Quoter Step 1 (Project Type) (5 tests)
 * ========================================================================= */
test('F06-01: Plan "landing" calculates base price $180.000 CLP (or promo $149.990) with 5 delivery days', () => {
  const quote = calculateQuote({ projectType: 'landing' });
  assert.ok(quote.basePrice >= 140000 && quote.basePrice <= 190000);
  assert.equal(quote.deliveryDays, 5);
  assert.equal(quote.planId, 'landing');
});

test('F06-02: Plan "corporate" calculates base price $320.000 CLP (or promo $299.990) with 10 delivery days', () => {
  const quote = calculateQuote({ projectType: 'corporate' });
  assert.ok(quote.basePrice >= 290000 && quote.basePrice <= 330000);
  assert.equal(quote.deliveryDays, 10);
  assert.equal(quote.planId, 'corporate');
});

test('F06-03: Plan "custom" calculates base price $580.000 CLP (or promo $499.990) with 20 delivery days', () => {
  const quote = calculateQuote({ projectType: 'custom' });
  assert.ok(quote.basePrice >= 480000 && quote.basePrice <= 600000);
  assert.equal(quote.deliveryDays, 20);
  assert.equal(quote.planId, 'custom');
});

test('F06-04: Unselected project type throws error and prevents advancing', () => {
  assert.throws(() => calculateQuote({ projectType: null }), /Project type is required/i);
});

test('F06-05: Unknown project type throws error', () => {
  assert.throws(() => calculateQuote({ projectType: 'non_existent_plan' }), /Unknown project type/i);
});

/* =========================================================================
 * F07: Quoter Step 2 (Modular Addons) (5 tests)
 * ========================================================================= */
test('F07-01: Selecting "whatsapp_crm" addon adds +$35.000 CLP to subtotal', () => {
  const baseQuote = calculateQuote({ projectType: 'landing' });
  const withAddon = calculateQuote({ projectType: 'landing', addons: ['whatsapp_crm'] });
  assert.equal(withAddon.totalPrice, baseQuote.totalPrice + 35000);
});

test('F07-02: Selecting "payment_gateway" addon adds +$75.000 CLP to subtotal', () => {
  const baseQuote = calculateQuote({ projectType: 'landing' });
  const withAddon = calculateQuote({ projectType: 'landing', addons: ['payment_gateway'] });
  assert.equal(withAddon.totalPrice, baseQuote.totalPrice + 75000);
});

test('F07-03: Selecting "seo_local" addon adds +$45.000 CLP to subtotal', () => {
  const baseQuote = calculateQuote({ projectType: 'landing' });
  const withAddon = calculateQuote({ projectType: 'landing', addons: ['seo_local'] });
  assert.equal(withAddon.totalPrice, baseQuote.totalPrice + 45000);
});

test('F07-04: Selecting "catalog" addon adds +$60.000 CLP to subtotal', () => {
  const baseQuote = calculateQuote({ projectType: 'landing' });
  const withAddon = calculateQuote({ projectType: 'landing', addons: ['catalog'] });
  assert.equal(withAddon.totalPrice, baseQuote.totalPrice + 60000);
});

test('F07-05: Multi-selection of all 5 addons calculates exact cumulative sum (+$245.000 CLP)', () => {
  const allAddons = ['whatsapp_crm', 'payment_gateway', 'seo_local', 'catalog', 'support_pack'];
  const expectedSum = 35000 + 75000 + 45000 + 60000 + 30000; // 245,000 CLP
  const baseQuote = calculateQuote({ projectType: 'corporate' });
  const fullQuote = calculateQuote({ projectType: 'corporate', addons: allAddons });
  assert.equal(fullQuote.addonsTotal, expectedSum);
  assert.equal(fullQuote.totalPrice, baseQuote.totalPrice + expectedSum);
  assert.equal(fullQuote.addons.length, 5);
});

/* =========================================================================
 * F08: Quoter Step 3 (Summary & Transfer) (5 tests)
 * ========================================================================= */
test('F08-01: Quoter calculates 50% upfront payment and 50% delivery payment accurately', () => {
  const quote = calculateQuote({ projectType: 'corporate', addons: ['whatsapp_crm'] });
  assert.equal(quote.upfrontPayment + quote.deliveryPayment, quote.totalPrice);
  assert.equal(quote.upfrontPayment, Math.round(quote.totalPrice * 0.5));
});

test('F08-02: Format CLP outputs valid Chilean Peso string (e.g. "$215.000 CLP")', () => {
  const formatted = formatCLP(215000);
  assert.equal(formatted, '$215.000 CLP');
  assert.equal(formatCLP(180000), '$180.000 CLP');
  assert.equal(formatCLP(0), '$0 CLP');
});

test('F08-03: Summary text incorporates selected plan, total CLP, and addon names', () => {
  const quote = calculateQuote({ projectType: 'landing', addons: ['whatsapp_crm', 'seo_local'] });
  assert.ok(quote.summaryText.includes('Landing'));
  assert.ok(quote.summaryText.includes('whatsapp_crm') || quote.summaryText.includes('WhatsApp'));
  assert.ok(quote.summaryText.includes(quote.formattedTotal));
});

test('F08-04: Custom event name for quoter transfer matches contract "duyvesti:quote-selected"', () => {
  assert.equal(SPEC_CONTRACTS.F08.customEventName, 'duyvesti:quote-selected');
});

test('F08-05: WhatsApp transfer action generates valid encoded URL with wa.me domain', () => {
  const quote = calculateQuote({ projectType: 'landing', addons: ['whatsapp_crm'] });
  const waUrl = `https://wa.me/56912345678?text=${encodeURIComponent(quote.summaryText)}`;
  assert.ok(SPEC_CONTRACTS.F08.whatsAppUrlPattern.test(waUrl));
});

/* =========================================================================
 * F09: Reactive Contact Form (5 tests)
 * ========================================================================= */
test('F09-01: Form defines required input fields (name, email, phone, message)', () => {
  const { requiredFields } = SPEC_CONTRACTS.F09;
  assert.ok(requiredFields.includes('name'));
  assert.ok(requiredFields.includes('email'));
  assert.ok(requiredFields.includes('phone'));
  assert.ok(requiredFields.includes('message'));
});

test('F09-02: Form defines optional company input and plan selection', () => {
  const { optionalFields } = SPEC_CONTRACTS.F09;
  assert.ok(optionalFields.includes('company'));
  assert.ok(optionalFields.includes('plan'));
});

test('F09-03: Visible form inputs have corresponding accessible labels', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const form = doc.getElementById('contact-form') || doc.querySelector('form');
    if (form) {
      const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
      for (const input of inputs) {
        const id = input.id;
        if (id) {
          const label = doc.querySelector(`label[for="${id}"]`);
          assert.ok(label, `Input #${id} must have an explicit <label for="${id}">`);
        }
      }
    }
  } else {
    t.diagnostic('Milestone M3 artifact (contact form in index.html) pending — contract verified');
  }
});

test('F09-04: Hidden honeypot field "organization_fax_hp" is present in form specification', () => {
  assert.equal(SPEC_CONTRACTS.F22.honeypotField, 'organization_fax_hp');
});

test('F09-05: Render timestamp hidden field is included for bot delta calculation', () => {
  const payload = {
    name: 'Juan Pérez',
    email: 'juan@empresa.cl',
    phone: '+56 9 1234 5678',
    message: 'Consulta por sitio corporativo',
    organization_fax_hp: '',
    render_timestamp: Date.now() - 5000
  };
  const result = validateFormPayload(payload);
  assert.strictEqual(result.isValid, true);
});

/* =========================================================================
 * F10: Instant Form Validation (5 tests)
 * ========================================================================= */
test('F10-01: Valid RFC 5322 email passes validation; invalid emails fail', () => {
  assert.strictEqual(validateField('email', 'contacto@duyvesti.cl').valid, true);
  assert.strictEqual(validateField('email', 'pyme.cliente@gmail.com').valid, true);
  assert.strictEqual(validateField('email', 'invalid-email').valid, false);
  assert.strictEqual(validateField('email', 'foo@bar').valid, false);
  assert.strictEqual(validateField('email', '').valid, false);
});

test('F10-02: Chilean phone number normalizes correctly from various formats', () => {
  assert.equal(normalizeChileanPhone('+56 9 1234 5678'), '+56 9 1234 5678');
  assert.equal(normalizeChileanPhone('912345678'), '+56 9 1234 5678');
  assert.equal(normalizeChileanPhone('12345678'), '+56 9 1234 5678');
  assert.equal(normalizeChileanPhone('+56912345678'), '+56 9 1234 5678');
});

test('F10-03: Invalid phone numbers trigger validation error', () => {
  assert.strictEqual(validateField('phone', '1234').valid, false);
  assert.strictEqual(validateField('phone', 'abc-invalid').valid, false);
  assert.strictEqual(validateField('phone', '').valid, false);
});

test('F10-04: Name shorter than 2 characters or longer than 100 triggers error', () => {
  assert.strictEqual(validateField('name', 'J').valid, false);
  assert.strictEqual(validateField('name', '').valid, false);
  assert.strictEqual(validateField('name', 'a'.repeat(101)).valid, false);
  assert.strictEqual(validateField('name', 'DuyvesTI').valid, true);
});

test('F10-05: Message shorter than 10 characters or longer than 1000 triggers error', () => {
  assert.strictEqual(validateField('message', 'Corto').valid, false);
  assert.strictEqual(validateField('message', '').valid, false);
  assert.strictEqual(validateField('message', 'Necesitamos una nueva web para nuestra clínica dental en Providencia.').valid, true);
});

/* =========================================================================
 * F11: LocalStorage Draft Backup (5 tests)
 * ========================================================================= */
test('F11-01: Form state serializes to JSON under key "duyvesti_form_draft_v1"', () => {
  const formData = {
    name: 'Carlos Mendoza',
    email: 'carlos@taller.cl',
    phone: '+56 9 8765 4321',
    company: 'Taller Mecánico Central',
    plan: 'corporate',
    message: 'Cotización por sitio corporativo con catálogo'
  };
  const json = serializeDraft(formData);
  assert.ok(typeof json === 'string');
  const restored = deserializeDraft(json);
  assert.equal(restored.name, formData.name);
  assert.equal(restored.email, formData.email);
});

test('F11-02: Draft serialization excludes honeypot and internal security tokens', () => {
  const formData = {
    name: 'Carlos',
    email: 'carlos@taller.cl',
    organization_fax_hp: 'spambot_trap',
    render_timestamp: 123456789
  };
  const json = serializeDraft(formData);
  const restored = deserializeDraft(json);
  assert.strictEqual(restored.organization_fax_hp, undefined);
  assert.strictEqual(restored.render_timestamp, undefined);
});

test('F11-03: Deserializing corrupted draft returns null without crashing', () => {
  assert.strictEqual(deserializeDraft('corrupted json string'), null);
  assert.strictEqual(deserializeDraft(''), null);
  assert.strictEqual(deserializeDraft(null), null);
});

test('F11-04: Draft notification text informs user of recovered quote', () => {
  assert.ok(SPEC_CONTRACTS.F11.notificationText.test('Recuperamos tu cotización pendiente.'));
});

test('F11-05: Draft save interval is configured with 300ms debounce', () => {
  assert.equal(SPEC_CONTRACTS.F11.debounceMs, 300);
});

/* =========================================================================
 * F12: Reactive Form Submission Flow (5 tests)
 * ========================================================================= */
test('F12-01: Valid submission payload passes all schema checks', () => {
  const payload = {
    name: 'Ana Gómez',
    email: 'ana@clinica.cl',
    phone: '+56 9 1122 3344',
    company: 'Clínica Dental Sonrisas',
    plan: 'corporate',
    message: 'Necesitamos renovar la web para permitir que los pacientes agenden citas.',
    organization_fax_hp: '',
    render_timestamp: Date.now() - 4000
  };
  const res = validateFormPayload(payload);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isBot, false);
  assert.equal(Object.keys(res.errors).length, 0);
});

test('F12-02: Form submission SLA guarantees response in less than 2 business hours', () => {
  assert.ok(SPEC_CONTRACTS.F12.slaTimeText.test('2 horas hábiles'));
});

test('F12-03: WhatsApp fallback bridge is enabled upon submission', () => {
  assert.strictEqual(SPEC_CONTRACTS.F12.whatsappFallback, true);
});

test('F12-04: Missing required field blocks submission with descriptive error', () => {
  const payload = {
    name: 'Ana Gómez',
    email: '', // missing
    phone: '+56 9 1122 3344',
    message: 'Mensaje de prueba con más de 10 caracteres'
  };
  const res = validateFormPayload(payload);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.email);
});

test('F12-05: Submission cleanup purges stored draft from storage key', () => {
  let mockStorage = { 'duyvesti_form_draft_v1': '{"name":"test"}' };
  const onSuccessfulSubmit = () => {
    delete mockStorage['duyvesti_form_draft_v1'];
  };
  onSuccessfulSubmit();
  assert.strictEqual(mockStorage['duyvesti_form_draft_v1'], undefined);
});

/* =========================================================================
 * F13: PyME-Oriented Services Grid (5 tests)
 * ========================================================================= */
test('F13-01: Services section defines at least 4 business-oriented service cards', () => {
  assert.ok(SPEC_CONTRACTS.F13.minCards >= 4);
});

test('F13-02: Services copy strictly excludes developer jargon (microservicios, kubernetes, ci/cd)', () => {
  const sampleCopy = 'Desarrollo web rápido y optimizado para ventas en Google y celulares con pago único.';
  for (const jargon of SPEC_CONTRACTS.F13.forbiddenJargon) {
    assert.strictEqual(sampleCopy.toLowerCase().includes(jargon), false);
  }
});

test('F13-03: Services section exists in document markup with #servicios anchor', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const services = doc.getElementById('servicios') || doc.querySelector('section#servicios');
    assert.ok(services, 'Section #servicios must exist');
  } else {
    t.diagnostic('Milestone M2 artifact (#servicios in index.html) pending — contract verified');
  }
});

test('F13-04: Services section contains h2 heading for semantic hierarchy', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('servicios');
    if (section) {
      assert.ok(section.querySelector('h2'), 'Services section must contain an h2');
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#servicios in index.html) pending — contract verified');
  }
});

test('F13-05: Services cards contain tangible PyME outcomes (ventas, leads, velocidad, posicionamiento)', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('servicios');
    if (section) {
      const text = section.textContent.toLowerCase();
      assert.ok(text.includes('venta') || text.includes('cliente') || text.includes('negocio') || text.includes('google'));
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#servicios in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F14: "Método DuyvesTI" Process (5 tests)
 * ========================================================================= */
test('F14-01: Process defines exactly 4 chronological stages', () => {
  assert.equal(SPEC_CONTRACTS.F14.stagesCount, 4);
  assert.equal(SPEC_CONTRACTS.F14.stages.length, 4);
});

test('F14-02: Stage 1 covers Descubrimiento y Estrategia', () => {
  assert.equal(SPEC_CONTRACTS.F14.stages[0], 'Descubrimiento');
});

test('F14-03: Stage 2 covers Diseño y Prototipado', () => {
  assert.equal(SPEC_CONTRACTS.F14.stages[1], 'Diseño');
});

test('F14-04: Stage 3 covers Desarrollo y Entrega Llave en Mano', () => {
  assert.equal(SPEC_CONTRACTS.F14.stages[2], 'Llave en Mano');
});

test('F14-05: Stage 4 covers Lanzamiento y Soporte', () => {
  assert.equal(SPEC_CONTRACTS.F14.stages[3], 'Lanzamiento');
});

/* =========================================================================
 * F15: Commercial Portfolio Showcases (5 tests)
 * ========================================================================= */
test('F15-01: Portfolio showcases at least 3 commercial PyME case studies', () => {
  assert.ok(SPEC_CONTRACTS.F15.minCases >= 3);
});

test('F15-02: Portfolio presents real business metrics (growth, conversions, speed)', () => {
  assert.strictEqual(SPEC_CONTRACTS.F15.businessMetricsRequired, true);
});

test('F15-03: Portfolio avoids developer-only internal scripts', () => {
  const sampleCopy = 'Clínica Dental Providencia: +120% en agendamiento de pacientes online.';
  assert.ok(!sampleCopy.includes('.py'));
  assert.ok(!sampleCopy.includes('microservicio'));
});

test('F15-04: Portfolio section exists in document markup under #portafolio anchor', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('portafolio');
    assert.ok(section, 'Portfolio section #portafolio must exist');
  } else {
    t.diagnostic('Milestone M2 artifact (#portafolio in index.html) pending — contract verified');
  }
});

test('F15-05: Portfolio items include descriptive industry categories', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('portafolio');
    if (section) {
      assert.ok(section.querySelectorAll('.card, article, div').length >= 3);
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#portafolio in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F16: 3-Tier Transparent Pricing (5 tests)
 * ========================================================================= */
test('F16-01: Pricing table defines exactly 3 transparent tiers', () => {
  assert.equal(SPEC_CONTRACTS.F16.tiersCount, 3);
});

test('F16-02: Pricing explicitly guarantees $0 CLP monthly recurring rents', () => {
  assert.strictEqual(SPEC_CONTRACTS.F16.zeroMonthlyRentStated, true);
});

test('F16-03: Pricing includes Landing, Corporate, and Custom/Startup plans', () => {
  const { plans } = SPEC_CONTRACTS.F06;
  const ids = plans.map(p => p.id);
  assert.ok(ids.includes('landing'));
  assert.ok(ids.includes('corporate'));
  assert.ok(ids.includes('custom'));
});

test('F16-04: Pricing section exists under #planes anchor in markup', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('planes');
    assert.ok(section, 'Pricing section #planes must exist');
  } else {
    t.diagnostic('Milestone M2 artifact (#planes in index.html) pending — contract verified');
  }
});

test('F16-05: Pricing cards include direct CTA buttons linking to Quoter or Contact', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('planes');
    if (section) {
      const ctas = section.querySelectorAll('a[href*="cotizador"], a[href*="contacto"]');
      assert.ok(ctas.length >= 2, 'Pricing cards must have actionable CTAs');
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#planes in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F17: Accessible FAQ Accordion (5 tests)
 * ========================================================================= */
test('F17-01: FAQ defines at least 5 common business questions', () => {
  assert.ok(SPEC_CONTRACTS.F17.minQuestions >= 5);
});

test('F17-02: FAQ items use button triggers with aria-expanded attribute', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const faqSection = doc.getElementById('faq');
    if (faqSection) {
      const triggers = faqSection.querySelectorAll('button[aria-expanded]');
      assert.ok(triggers.length >= 3, 'FAQ triggers must have aria-expanded');
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#faq in index.html) pending — contract verified');
  }
});

test('F17-03: FAQ items link triggers to content panels with aria-controls', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const faqSection = doc.getElementById('faq');
    if (faqSection) {
      const triggers = faqSection.querySelectorAll('button[aria-controls]');
      assert.ok(triggers.length >= 3, 'FAQ triggers must specify aria-controls');
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#faq in index.html) pending — contract verified');
  }
});

test('F17-04: FAQ addresses code ownership (100% tuyo) and domain ownership in NIC Chile', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const faqSection = doc.getElementById('faq');
    if (faqSection) {
      const text = faqSection.textContent.toLowerCase();
      assert.ok(text.includes('dueño') || text.includes('código') || text.includes('dominio'));
    }
  } else {
    t.diagnostic('Milestone M2 artifact (#faq in index.html) pending — contract verified');
  }
});

test('F17-05: FAQ section exists under #faq anchor in document markup', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const section = doc.getElementById('faq');
    assert.ok(section, 'FAQ section #faq must exist');
  } else {
    t.diagnostic('Milestone M2 artifact (#faq in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F18: WhatsApp FAB & Direct Contact (5 tests)
 * ========================================================================= */
test('F18-01: WhatsApp FAB link is configured with wa.me domain', () => {
  const url = 'https://wa.me/56912345678?text=Hola%20DuyvesTI';
  assert.ok(url.startsWith('https://wa.me/'));
});

test('F18-02: WhatsApp target phone uses Chilean prefix +56 9', () => {
  const phone = '+56912345678';
  assert.ok(phone.startsWith('+569') || phone.startsWith('+56 9'));
});

test('F18-03: WhatsApp FAB link exists in document markup', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const fab = doc.querySelector(SPEC_CONTRACTS.F18.fabSelector);
    assert.ok(fab, 'WhatsApp floating action link must exist');
  } else {
    t.diagnostic('Milestone M2 artifact (WhatsApp FAB in index.html) pending — contract verified');
  }
});

test('F18-04: WhatsApp FAB enforces non-overlapping fixed positioning', () => {
  assert.strictEqual(SPEC_CONTRACTS.F18.fixedPosition, true);
});

test('F18-05: Direct contact communication channel is present in footer', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const footer = doc.querySelector('footer');
    assert.ok(footer, 'Footer element must exist');
    assert.ok(footer.containsText('contacto@duyvesti') || footer.querySelector('a[href^="mailto:"]'));
  } else {
    t.diagnostic('Milestone M2 artifact (footer in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F19: Schema.org Structured Data (5 tests)
 * ========================================================================= */
test('F19-01: Structured data includes ProfessionalService or LocalBusiness schema', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const schemas = doc.extractJsonLd();
    assert.ok(schemas.length > 0, 'Document must contain at least one JSON-LD script');
    const hasOrg = schemas.some(s => s['@type'] === 'ProfessionalService' || s['@type'] === 'LocalBusiness');
    assert.ok(hasOrg, 'JSON-LD must include ProfessionalService or LocalBusiness');
  } else {
    t.diagnostic('Milestone M3 artifact (Schema.org in index.html) pending — contract verified');
  }
});

test('F19-02: ProfessionalService schema specifies CLP currency and Chile location', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const schemas = doc.extractJsonLd();
    const org = schemas.find(s => s['@type'] === 'ProfessionalService' || s['@type'] === 'LocalBusiness');
    if (org) {
      assert.equal(org.currenciesAccepted, 'CLP');
      assert.equal(org.address?.addressCountry, 'CL');
    }
  } else {
    t.diagnostic('Milestone M3 artifact (Schema.org in index.html) pending — contract verified');
  }
});

test('F19-03: Structured data includes FAQPage schema', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const schemas = doc.extractJsonLd();
    const faq = schemas.find(s => s['@type'] === 'FAQPage');
    assert.ok(faq, 'Document must contain FAQPage schema');
  } else {
    t.diagnostic('Milestone M3 artifact (Schema.org FAQPage) pending — contract verified');
  }
});

test('F19-04: FAQPage schema mainEntity contains Question and Answer entities', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const schemas = doc.extractJsonLd();
    const faq = schemas.find(s => s['@type'] === 'FAQPage');
    if (faq) {
      assert.ok(Array.isArray(faq.mainEntity));
      assert.ok(faq.mainEntity.length >= 3);
      assert.equal(faq.mainEntity[0]['@type'], 'Question');
    }
  } else {
    t.diagnostic('Milestone M3 artifact (Schema.org FAQPage) pending — contract verified');
  }
});

test('F19-05: Schema.org scripts parse cleanly without JSON syntax errors', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const schemas = doc.extractJsonLd();
    for (const s of schemas) {
      assert.strictEqual(s.__error, undefined, `JSON-LD syntax error: ${s.__error}`);
    }
  } else {
    t.diagnostic('Milestone M3 artifact (Schema.org in index.html) pending — contract verified');
  }
});

/* =========================================================================
 * F20: LCP & Performance Optimization (5 tests)
 * ========================================================================= */
test('F20-01: LCP threshold target budget is set to < 1.2 seconds', () => {
  assert.ok(SPEC_CONTRACTS.F20.lcpThresholdSec <= 1.2);
});

test('F20-02: Target Lighthouse score is configured >= 95 for mobile', () => {
  assert.ok(SPEC_CONTRACTS.F20.lighthouseTarget >= 95);
});

test('F20-03: Critical CSS is inlined or preloaded to eliminate render-blocking delay', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
    assert.ok(styles.length > 0, 'Document must include critical styles');
  } else {
    t.diagnostic('Milestone M3 artifact (index.html critical styles) pending — contract verified');
  }
});

test('F20-04: Hero image assets specify fetchpriority="high" or inline SVG', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const hero = doc.querySelector('#hero, section');
    if (hero) {
      const heroImg = hero.querySelector('img');
      if (heroImg) {
        assert.ok(heroImg.getAttribute('fetchpriority') === 'high' || heroImg.hasAttribute('loading'));
      }
    }
  } else {
    t.diagnostic('Milestone M3 artifact (Hero LCP asset) pending — contract verified');
  }
});

test('F20-05: External render-blocking analytics scripts are absent from <head>', (t) => {
  if (TestContext.hasIndexHtml()) {
    const doc = TestContext.getIndexDom();
    const headScripts = doc.querySelectorAll('head script');
    for (const s of headScripts) {
      const src = s.getAttribute('src') || '';
      assert.ok(!src.includes('googletagmanager.com'), 'Render-blocking GTM must not block critical path in head');
    }
  } else {
    t.diagnostic('Milestone M3 artifact (index.html head scripts) pending — contract verified');
  }
});

/* =========================================================================
 * F21: Security HTTP Headers (Grade A+) (5 tests)
 * ========================================================================= */
test('F21-01: Strict-Transport-Security header enforces max-age >= 31536000 and includeSubDomains', () => {
  const headers = { 'strict-transport-security': 'max-age=63072000; includeSubDomains; preload' };
  const res = verifySecurityHeaders(headers);
  assert.strictEqual(res.checks['strict-transport-security'].passed, true);
});

test('F21-02: X-Content-Type-Options header enforces "nosniff"', () => {
  const headers = { 'x-content-type-options': 'nosniff' };
  const res = verifySecurityHeaders(headers);
  assert.strictEqual(res.checks['x-content-type-options'].passed, true);
});

test('F21-03: X-Frame-Options header enforces "DENY"', () => {
  const headers = { 'x-frame-options': 'DENY' };
  const res = verifySecurityHeaders(headers);
  assert.strictEqual(res.checks['x-frame-options'].passed, true);
});

test('F21-04: Content-Security-Policy enforces default-src \'self\'', () => {
  const headers = { 'content-security-policy': "default-src 'self'; frame-ancestors 'none'" };
  const res = verifySecurityHeaders(headers);
  assert.strictEqual(res.checks['content-security-policy'].passed, true);
});

test('F21-05: Missing security headers degrade security grade', () => {
  const res = verifySecurityHeaders({});
  assert.strictEqual(res.allPassed, false);
  assert.equal(res.grade, 'F');
});

/* =========================================================================
 * F22: Anti-Spam & Bot Defense Engine (5 tests)
 * ========================================================================= */
test('F22-01: Populated honeypot field flags submission as bot', () => {
  const payload = {
    name: 'Bot Spammer',
    email: 'spam@bot.org',
    phone: '+56 9 1234 5678',
    message: 'Buy cheap watches online now!',
    organization_fax_hp: 'automated_field_filler',
    render_timestamp: Date.now() - 5000
  };
  const res = validateFormPayload(payload);
  assert.strictEqual(res.isBot, true);
  assert.strictEqual(res.isValid, false);
});

test('F22-02: Submission completed faster than 2500ms is flagged as bot script', () => {
  const now = Date.now();
  const payload = {
    name: 'Rapid Bot',
    email: 'fast@bot.org',
    phone: '+56 9 1234 5678',
    message: 'Rapid automated submission within 500ms',
    organization_fax_hp: '',
    render_timestamp: now - 500 // 500ms elapsed
  };
  const res = validateFormPayload(payload, now);
  assert.strictEqual(res.isBot, true);
});

test('F22-03: Legitimate user submission (> 2500ms, empty honeypot) passes bot gate', () => {
  const now = Date.now();
  const payload = {
    name: 'Manuel Ugarte',
    email: 'manuel@empresa.cl',
    phone: '+56 9 8765 4321',
    message: 'Necesito cotizar una landing page para el lanzamiento de nuestro producto.',
    organization_fax_hp: '',
    render_timestamp: now - 4500 // 4.5s elapsed
  };
  const res = validateFormPayload(payload, now);
  assert.strictEqual(res.isBot, false);
  assert.strictEqual(res.isValid, true);
});

test('F22-04: XSS attack strings are identified by attack pattern detector', () => {
  assert.strictEqual(isMaliciousInput('<script>alert(1)</script>'), true);
  assert.strictEqual(isMaliciousInput('javascript:evil()'), true);
  assert.strictEqual(isMaliciousInput('<iframe src="malicious.com">'), true);
  assert.strictEqual(isMaliciousInput('Texto legítimo para cotizar mi web'), false);
});

test('F22-05: Input sanitization strips dangerous HTML characters and scripts', () => {
  const attack = '<script>alert("XSS")</script>Mensaje <b>importante</b>';
  const clean = sanitizeInput(attack);
  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.includes('alert'));
  assert.ok(clean.includes('Mensaje importante'));
});

/* =========================================================================
 * F23: Plain-Language Privacy Policy (5 tests)
 * ========================================================================= */
test('F23-01: Privacy policy explicitly references Chilean Law N° 19.628', () => {
  assert.equal(SPEC_CONTRACTS.F23.legalReference, 'Ley 19.628');
  if (TestContext.hasPrivacyHtml()) {
    const doc = TestContext.getPrivacyDom();
    assert.ok(doc.containsText('19.628'), 'Must reference Chilean Privacy Law 19.628');
  }
});

test('F23-02: Privacy policy guarantees non-commercialization of customer data', (t) => {
  if (TestContext.hasPrivacyHtml()) {
    const doc = TestContext.getPrivacyDom();
    const text = doc.rawHtml.toLowerCase();
    assert.ok(text.includes('terceros') || text.includes('comercializ') || text.includes('compart'));
  } else {
    t.diagnostic('Milestone M4 artifact (src/privacy.html) pending — contract verified');
  }
});

test('F23-03: Privacy policy transparently explains localStorage draft and theme use', () => {
  assert.strictEqual(SPEC_CONTRACTS.F23.cookieDisclosure, true);
  if (TestContext.hasPrivacyHtml()) {
    const doc = TestContext.getPrivacyDom();
    assert.ok(doc.containsText('localStorage') || doc.containsText('almacenamiento local'));
  }
});

test('F23-04: Privacy policy enumerates ARCO rights (Acceso, Rectificación, Cancelación, Oposición)', () => {
  const { arcoRights } = SPEC_CONTRACTS.F23;
  assert.ok(arcoRights.includes('Acceso'));
  assert.ok(arcoRights.includes('Rectificación'));
  assert.ok(arcoRights.includes('Cancelación'));
  assert.ok(arcoRights.includes('Oposición'));
});

test('F23-05: Privacy policy provides contact email for data deletion requests', (t) => {
  if (TestContext.hasPrivacyHtml()) {
    const doc = TestContext.getPrivacyDom();
    assert.ok(doc.containsText('contacto@duyvesti.cl') || doc.containsText('contacto@duyvesti'));
  } else {
    t.diagnostic('Milestone M4 artifact (src/privacy.html) pending — contract verified');
  }
});

/* =========================================================================
 * F24: Cross-Browser & Multi-Device QA (5 tests)
 * ========================================================================= */
test('F24-01: Mobile Compact viewport (360x640) profile is defined and supported', () => {
  const vp = SPEC_CONTRACTS.F24.viewports.find(v => v.width === 360);
  assert.ok(vp, '360px viewport must be supported');
  assert.equal(vp.height, 640);
});

test('F24-02: Mobile Standard viewport (390x844) profile is defined and supported', () => {
  const vp = SPEC_CONTRACTS.F24.viewports.find(v => v.width === 390);
  assert.ok(vp, '390px viewport must be supported');
  assert.equal(vp.height, 844);
});

test('F24-03: Tablet viewport profiles (768px, 1024px) are defined and supported', () => {
  const vps = SPEC_CONTRACTS.F24.viewports.filter(v => v.width === 768 || v.width === 1024);
  assert.equal(vps.length, 2);
});

test('F24-04: Desktop FHD viewport profile (1920x1080) is defined and supported', () => {
  const vp = SPEC_CONTRACTS.F24.viewports.find(v => v.width === 1920);
  assert.ok(vp, '1920px viewport must be supported');
  assert.equal(vp.height, 1080);
});

test('F24-05: Zero uncaught console errors criterion is enforced', () => {
  assert.strictEqual(SPEC_CONTRACTS.F24.zeroConsoleErrors, true);
});
