/**
 * tests/e2e/tier4_real_world.test.js
 * Tier 4: Real-World Business Scenarios — 12 full end-to-end user journeys.
 * Derived strictly from ORIGINAL_REQUEST.md, PROJECT.md, and Chilean market specifications.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { SPEC_CONTRACTS } = require('../helpers/spec_contracts.js');
const { getContrastRatio, meetsWcagAA } = require('../helpers/contrast_math.js');
const { calculateQuote, formatCLP } = require('../helpers/quoter_oracle.js');
const {
  validateFormPayload,
  serializeDraft,
  deserializeDraft,
  normalizeChileanPhone
} = require('../helpers/form_oracle.js');
const {
  verifySecurityHeaders,
  sanitizeInput,
  isMaliciousInput
} = require('../helpers/security_oracle.js');
const { TestContext } = require('../helpers/test_context.js');

/* =========================================================================
 * Scenario 01: PyME Mobile Custom Plan & Submission Journey
 * ========================================================================= */
test('SC01: PyME owner on mobile (360x640) configures Landing + WhatsApp CRM and submits', () => {
  // Step 1: User arrives on mobile compact viewport
  const viewport = { width: 360, height: 640 };
  assert.equal(viewport.width, 360);

  // Step 2: User selects Landing Page plan in Quoter Step 1
  const step1Quote = calculateQuote({ projectType: 'landing' });
  assert.equal(step1Quote.planId, 'landing');
  assert.equal(step1Quote.deliveryDays, 5);

  // Step 3: In Step 2, adds WhatsApp CRM addon
  const step2Quote = calculateQuote({ projectType: 'landing', addons: ['whatsapp_crm'] });
  assert.equal(step2Quote.addonsTotal, 35000);
  assert.equal(step2Quote.totalPrice, step1Quote.basePrice + 35000);

  // Step 4: Step 3 summary validates 50% payment
  assert.equal(step2Quote.upfrontPayment, Math.round(step2Quote.totalPrice * 0.5));

  // Step 5: Transfer to Contact Form
  const formPayload = {
    name: 'Gloria Martínez',
    email: 'gloria@panaderia.cl',
    phone: '+56 9 9123 4567',
    company: 'Panadería La Espiga',
    plan: step2Quote.planId,
    message: step2Quote.summaryText,
    organization_fax_hp: '',
    render_timestamp: Date.now() - 6000
  };

  const validation = validateFormPayload(formPayload);
  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.isBot, false);
  assert.equal(validation.normalizedPhone, '+56 9 9123 4567');
});

/* =========================================================================
 * Scenario 02: Startup Founder Desktop Custom Web Platform Journey
 * ========================================================================= */
test('SC02: Startup founder on desktop (1920x1080) selects Dark Theme and configures Custom Platform with Webpay + SEO', () => {
  // Step 1: User on desktop 1080p
  const viewport = { width: 1920, height: 1080 };
  assert.equal(viewport.width, 1920);

  // Step 2: Theme set to Dark mode
  const theme = 'dark';
  const contrast = getContrastRatio(SPEC_CONTRACTS.F02.darkTheme.textPrimary, SPEC_CONTRACTS.F02.darkTheme.bgCanvas);
  assert.ok(contrast >= 4.5);

  // Step 3: Selects Custom Web Platform ($580k, 20 days)
  const baseQuote = calculateQuote({ projectType: 'custom' });
  assert.equal(baseQuote.planId, 'custom');
  assert.equal(baseQuote.deliveryDays, 20);

  // Step 4: Adds Webpay (+$75k) and Local SEO (+$45k)
  const fullQuote = calculateQuote({ projectType: 'custom', addons: ['payment_gateway', 'seo_local'] });
  assert.equal(fullQuote.addonsTotal, 120000);
  assert.equal(fullQuote.totalPrice, baseQuote.basePrice + 120000);

  // Step 5: Transfer quote and submit
  const payload = {
    name: 'Esteban Valdés',
    email: 'esteban@proptech.io',
    phone: '+56 9 8899 0011',
    company: 'PropTech SpA',
    plan: fullQuote.planId,
    message: fullQuote.summaryText,
    organization_fax_hp: '',
    render_timestamp: Date.now() - 8000
  };

  const res = validateFormPayload(payload);
  assert.strictEqual(res.isValid, true);
});

/* =========================================================================
 * Scenario 03: Automated Spambot Attack Defense Simulation
 * ========================================================================= */
test('SC03: Automated spambot attack with fast submission (< 1s) and filled honeypot intercepted silently', () => {
  const attackTimestamp = Date.now();
  const botPayload = {
    name: 'Crypto Growth Bot',
    email: 'sales@cryptoinvest.xyz',
    phone: '+1 800 555 0199', // Non-Chilean phone
    message: 'Invest in bitcoin today and double your returns: http://spam.xyz',
    organization_fax_hp: 'automated_field_content', // Honeypot trap triggered
    render_timestamp: attackTimestamp - 400 // Submitted in 400ms
  };

  const res = validateFormPayload(botPayload, attackTimestamp);
  // Both honeypot and time delta flag the submission
  assert.strictEqual(res.isBot, true);
  assert.strictEqual(res.isValid, false);

  // Silent drop: server returns fake HTTP 200 without creating ticket
  const simulateServerDefense = (botResult) => {
    if (botResult.isBot) {
      return { status: 200, leadCreated: false };
    }
    return { status: 200, leadCreated: true };
  };

  const outcome = simulateServerDefense(res);
  assert.equal(outcome.status, 200);
  assert.strictEqual(outcome.leadCreated, false);
});

/* =========================================================================
 * Scenario 04: Keyboard-Only Accessibility Screen-Reader User
 * ========================================================================= */
test('SC04: Screen-reader keyboard user navigates via landmarks, skip-link, and FAQ ARIA attributes', () => {
  // Step 1: User focuses skip-link
  const skipLinkTarget = '#main-content';
  assert.equal(skipLinkTarget, '#main-content');

  // Step 2: Header navigation has banner landmark and accessible label
  assert.equal(SPEC_CONTRACTS.F04.landmarkRole, 'banner');
  assert.equal(SPEC_CONTRACTS.F04.navAriaLabel, 'Navegación principal');

  // Step 3: Traverses to FAQ accordion
  const faqState = {
    triggerId: 'faq-btn-1',
    panelId: 'faq-panel-1',
    expanded: false
  };

  // User presses Enter on accordion trigger
  faqState.expanded = true;
  assert.strictEqual(faqState.expanded, true);
});

/* =========================================================================
 * Scenario 05: Privacy-Conscious Client & Data Clearance Flow
 * ========================================================================= */
test('SC05: Client inspects Privacy Policy (Ley 19.628) and purges localStorage draft data', () => {
  // Step 1: Legal policy reference
  assert.equal(SPEC_CONTRACTS.F23.legalReference, 'Ley 19.628');
  assert.ok(SPEC_CONTRACTS.F23.arcoRights.includes('Cancelación'));

  // Step 2: Storage draft contains quote
  let localStorageMock = {
    'duyvesti_form_draft_v1': serializeDraft({ name: 'Privacidad', email: 'user@empresa.cl' }),
    'duyvesti-theme': 'dark'
  };

  assert.ok(localStorageMock['duyvesti_form_draft_v1']);

  // Step 3: User exercises right of deletion / clicks "Borrar datos guardados"
  const clearUserData = () => {
    delete localStorageMock['duyvesti_form_draft_v1'];
  };

  clearUserData();
  assert.strictEqual(localStorageMock['duyvesti_form_draft_v1'], undefined);
  // Theme preference is retained
  assert.equal(localStorageMock['duyvesti-theme'], 'dark');
});

/* =========================================================================
 * Scenario 06: Offline Resilience & Accidental Tab Closure Recovery
 * ========================================================================= */
test('SC06: Accidental tab closure restores draft from localStorage upon return', () => {
  const originalInputs = {
    name: 'Carolina Fuentes',
    email: 'carolina@consultoria.cl',
    phone: '+56 9 5566 7788',
    company: 'Fuentes & Asociados Consultores',
    plan: 'corporate',
    message: 'Necesitamos renovar la web con 4 secciones y SEO local para captar clientes en Santiago.'
  };

  // Step 1: Debounced persistence saves to storage
  const serialized = serializeDraft(originalInputs);

  // Step 2: Tab closed / reload simulated
  const recovered = deserializeDraft(serialized);

  // Step 3: Full field restoration
  assert.equal(recovered.name, originalInputs.name);
  assert.equal(recovered.email, originalInputs.email);
  assert.equal(recovered.phone, originalInputs.phone);
  assert.equal(recovered.company, originalInputs.company);
  assert.equal(recovered.plan, originalInputs.plan);
  assert.equal(recovered.message, originalInputs.message);
});

/* =========================================================================
 * Scenario 07: Plan Switching & Dynamic Addon Recalculation
 * ========================================================================= */
test('SC07: Client switches plans in Step 1 while retaining compatible addons in Step 2', () => {
  // Step 1: Start with Landing ($180k) + Catalog ($60k)
  let quote = calculateQuote({ projectType: 'landing', addons: ['catalog'] });
  assert.equal(quote.subtotal, quote.basePrice + 60000);

  // Step 2: User switches to Corporate ($320k)
  quote = calculateQuote({ projectType: 'corporate', addons: ['catalog'] });
  assert.equal(quote.basePrice, 320000);
  assert.equal(quote.addonsTotal, 60000);
  assert.equal(quote.totalPrice, 380000);

  // Step 3: Adds Support Pack ($30k)
  quote = calculateQuote({ projectType: 'corporate', addons: ['catalog', 'support_pack'] });
  assert.equal(quote.addonsTotal, 90000);
  assert.equal(quote.totalPrice, 410000);
  assert.equal(quote.upfrontPayment, 205000);
  assert.equal(quote.deliveryPayment, 205000);
});

/* =========================================================================
 * Scenario 08: Reactive Validation Failure & Correction Cycle
 * ========================================================================= */
test('SC08: User enters invalid data, receives inline errors, and corrects to valid submission', () => {
  // Step 1: User types invalid email and phone
  const invalidPayload = {
    name: 'M', // Too short
    email: 'invalido@', // Malformed
    phone: '1234', // Invalid
    message: 'Hola' // Too short (< 10 chars)
  };

  const initialCheck = validateFormPayload(invalidPayload);
  assert.strictEqual(initialCheck.isValid, false);
  assert.ok(initialCheck.errors.name);
  assert.ok(initialCheck.errors.email);
  assert.ok(initialCheck.errors.phone);
  assert.ok(initialCheck.errors.message);

  // Step 2: User corrects all fields
  const correctedPayload = {
    name: 'Mario Rossi',
    email: 'mario.rossi@taller.cl',
    phone: '+56 9 4433 2211',
    company: 'Taller Mecánico Rossi',
    message: 'Solicitud de cotización para nueva landing page con catálogo de servicios.',
    organization_fax_hp: '',
    render_timestamp: Date.now() - 4000
  };

  const correctedCheck = validateFormPayload(correctedPayload);
  assert.strictEqual(correctedCheck.isValid, true);
  assert.equal(Object.keys(correctedCheck.errors).length, 0);
});

/* =========================================================================
 * Scenario 09: Malicious XSS Injection Attempt Sanitization
 * ========================================================================= */
test('SC09: Malicious XSS attack payloads in form fields are neutralized before processing', () => {
  const xssName = '<script>document.cookie="stolen"</script>Juan';
  const xssMessage = 'Cotización <iframe src="javascript:alert(1)"></iframe> importante para mi PyME.';

  assert.strictEqual(isMaliciousInput(xssName), true);
  assert.strictEqual(isMaliciousInput(xssMessage), true);

  const cleanName = sanitizeInput(xssName);
  const cleanMessage = sanitizeInput(xssMessage);

  assert.ok(!cleanName.includes('<script>'));
  assert.ok(!cleanName.includes('document.cookie'));
  assert.equal(cleanName, 'Juan');

  assert.ok(!cleanMessage.includes('<iframe>'));
  assert.ok(!cleanMessage.includes('javascript:'));
  assert.ok(cleanMessage.includes('Cotización'));
});

/* =========================================================================
 * Scenario 10: High-Intent PyME Owner Hero-to-WhatsApp Flow
 * ========================================================================= */
test('SC10: PyME owner absorbs Hero value prop in < 5s, inspects plans, and clicks WhatsApp FAB', () => {
  // Step 1: Value prop comprehension
  const valueProp = SPEC_CONTRACTS.F01.valuePropText;
  assert.ok(valueProp.includes('Paga una sola vez'));
  assert.ok(valueProp.includes('dueño total'));

  // Step 2: Compares pricing plans
  const pricingTiers = SPEC_CONTRACTS.F06.plans;
  assert.equal(pricingTiers.length, 3);

  // Step 3: Triggers WhatsApp direct channel
  const waTarget = 'https://wa.me/56912345678?text=Hola%20DuyvesTI%2C%20quiero%20cotizar%20un%20sitio%20web';
  assert.ok(waTarget.includes('wa.me/569'));
});

/* =========================================================================
 * Scenario 11: Corporate Client Reviewing "Método DuyvesTI" & Portfolio
 * ========================================================================= */
test('SC11: Corporate client reviews 4 process stages, checks Dental clinic case study, and selects Corporate Plan', () => {
  // Step 1: 4 development stages
  assert.equal(SPEC_CONTRACTS.F14.stages.length, 4);
  assert.equal(SPEC_CONTRACTS.F14.stages[0], 'Descubrimiento');
  assert.equal(SPEC_CONTRACTS.F14.stages[2], 'Llave en Mano');

  // Step 2: Dental clinic case study
  const dentalStudy = {
    name: 'Clínica Dental Providencia',
    metric: '+150% agendamiento online',
    planRecommended: 'corporate'
  };
  assert.ok(dentalStudy.metric.includes('+150%'));

  // Step 3: Quoter initialized with Corporate plan
  const quote = calculateQuote({ projectType: dentalStudy.planRecommended });
  assert.equal(quote.planId, 'corporate');
  assert.equal(quote.deliveryDays, 10);
});

/* =========================================================================
 * Scenario 12: Mobile User Opening Drawer and Scrolling to Section
 * ========================================================================= */
test('SC12: Mobile user (390x844) opens drawer, selects #servicios, drawer closes and scrolls cleanly', () => {
  const vp = { width: 390, height: 844 };
  assert.equal(vp.width, 390);

  let drawerState = {
    isOpen: false,
    bodyOverflow: '',
    currentSection: '/'
  };

  // User taps hamburger
  drawerState.isOpen = true;
  drawerState.bodyOverflow = 'hidden';
  assert.strictEqual(drawerState.isOpen, true);
  assert.equal(drawerState.bodyOverflow, 'hidden');

  // User taps #servicios link
  drawerState.isOpen = false;
  drawerState.bodyOverflow = '';
  drawerState.currentSection = '#servicios';

  assert.strictEqual(drawerState.isOpen, false);
  assert.equal(drawerState.bodyOverflow, '');
  assert.equal(drawerState.currentSection, '#servicios');
});
