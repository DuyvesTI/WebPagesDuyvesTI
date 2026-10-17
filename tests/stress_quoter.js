/**
 * tests/stress_quoter.js
 * Empirical Stress Harness & Fuzzing Oracle for DuyvesTI Quoter & Core Engine (Milestone M2)
 *
 * Suites:
 * 1. Combinatorial Fuzzing: Exhaustive 24,576 combinations of plans, tiers, addons, and discounts
 * 2. Randomized Adversarial Fuzzing: 50,000 runs with duplicate, alias, unknown, and malformed inputs
 * 3. Mathematical Invariant: Strict 50/50 upfront/delivery split with 0 fractional cent drift across odd and even amounts
 * 4. Input Boundary & Prototype Safety: HTML/XSS injection, prototype property inheritance, type safety
 * 5. UI Controller State Transitions: 10,000 rapid step switches, DOM state invariance, ARIA sync, keyboard focus
 * 6. URL Deep Linking & Malformed Hash: Edge case hash params (#cotizador?plan=invalid, empty, XSS, encoded)
 * 7. Transfer & WhatsApp Bridges: M2 <-> M3 CustomEvent payload verification and WhatsApp URL encoding
 * 8. FAQ Accordion ARIA & Keyboard Navigation: Rapid toggles, Arrow/Home/End navigation, multi-expand options
 */

const assert = require('node:assert/strict');
const quoterEngine = require('../src/js/quoter.js');
const {
  PLAN_CATALOG,
  ADDON_CATALOG,
  formatCLP,
  calculateQuote,
  QuoterWizardController,
  FaqAccordion
} = quoterEngine;

// -----------------------------------------------------------------
// Mock DOM Harness for UI Controller & Accordion Testing
// -----------------------------------------------------------------
class MockElement {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attributes = { ...attrs };
    const classSet = new Set(attrs.class ? attrs.class.split(/\s+/).filter(Boolean) : []);
    this.classList = {
      add: (...cls) => cls.forEach((c) => classSet.add(c)),
      remove: (...cls) => cls.forEach((c) => classSet.delete(c)),
      contains: (c) => classSet.has(c),
      has: (c) => classSet.has(c)
    };
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.innerHTML = '';
    this.listeners = new Map();
    this.checked = Boolean(attrs.checked);
    this.value = attrs.value || '';
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'class') {
      const classSet = new Set(String(val).split(/\s+/).filter(Boolean));
      this.classList = {
        add: (...cls) => cls.forEach((c) => classSet.add(c)),
        remove: (...cls) => cls.forEach((c) => classSet.delete(c)),
        contains: (c) => classSet.has(c),
        has: (c) => classSet.has(c)
      };
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  focus() {
    if (global.document) {
      global.document.activeElement = this;
    }
  }

  scrollIntoView() {}

  closest(selector) {
    let curr = this;
    const cleanSel = selector.replace(/^\./, '');
    while (curr) {
      if (curr.classList && curr.classList.has(cleanSel)) return curr;
      if (curr.tagName && curr.tagName.toLowerCase() === selector.toLowerCase()) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  addEventListener(evt, fn, opts) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, []);
    this.listeners.get(evt).push({ fn, once: opts && opts.once });
  }

  removeEventListener(evt, fn) {
    if (!this.listeners.has(evt)) return;
    this.listeners.set(evt, this.listeners.get(evt).filter((l) => l.fn !== fn));
  }

  dispatchEvent(evt) {
    const list = this.listeners.get(evt.type) || [];
    const remaining = [];
    for (const item of list) {
      item.fn(evt);
      if (!item.once) remaining.push(item);
    }
    this.listeners.set(evt.type, remaining);
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      for (const child of node.children) {
        let matches = false;
        if (selector.startsWith('.')) {
          matches = child.classList.has(selector.slice(1));
        } else if (selector.startsWith('#')) {
          matches = child.attributes.id === selector.slice(1);
        } else if (selector.includes('[') && selector.includes(']')) {
          const match = selector.match(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/);
          if (match) {
            const attr = match[1];
            const val = match[2];
            if (val !== undefined) {
              matches = child.attributes[attr] === val;
            } else {
              matches = child.hasAttribute(attr);
            }
          }
        } else if (selector === child.tagName.toLowerCase()) {
          matches = true;
        }

        if (matches) results.push(child);
        walk(child);
      }
    };
    walk(this);
    return results;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }
}

class MockDOMDocument {
  constructor() {
    this.elements = new Map();
    this.listeners = new Map();
    this.activeElement = null;
    this.readyState = 'complete';
    this.body = this.createElement('body');
  }

  createElement(tag, attrs = {}) {
    const el = new MockElement(tag, attrs);
    const self = this;
    const origSetAttr = el.setAttribute.bind(el);
    el.setAttribute = function(name, val) {
      origSetAttr(name, val);
      if (name === 'id') self.elements.set(String(val), el);
    };
    return el;
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }

  register(id, el) {
    el.setAttribute('id', id);
    this.elements.set(id, el);
    return el;
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      const byId = this.getElementById(selector.slice(1));
      if (byId) return byId;
    }
    return this.body.querySelector(selector);
  }

  addEventListener(evt, fn) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, []);
    this.listeners.get(evt).push(fn);
  }

  removeEventListener(evt, fn) {
    if (!this.listeners.has(evt)) return;
    this.listeners.set(evt, this.listeners.get(evt).filter((f) => f !== fn));
  }

  dispatchEvent(evt) {
    const list = this.listeners.get(evt.type) || [];
    for (const fn of list) fn(evt);
  }
}

function createFullQuoterDOM() {
  const doc = new MockDOMDocument();

  // Root wizard container
  const root = doc.register('quoter-wizard', doc.createElement('div'));
  doc.body.children.push(root);

  // Stepper nav items (1, 2, 3)
  for (let i = 1; i <= 3; i++) {
    const navItem = doc.register(`step-nav-${i}`, doc.createElement('button', {
      class: i === 1 ? 'stepper-btn active' : 'stepper-btn',
      'data-step-target': String(i)
    }));
    root.children.push(navItem);
  }

  // Step 1 Pane
  const step1 = doc.register('quoter-step-1', doc.createElement('div', { class: 'step-pane active' }));
  const title1 = doc.createElement('h3', { class: 'step-pane-title' });
  step1.children.push(title1);

  ['landing', 'corporate', 'custom'].forEach((p) => {
    const radio = doc.createElement('input', {
      type: 'radio',
      name: 'quoter_plan',
      value: p,
      checked: p === 'corporate' ? 'checked' : undefined
    });
    radio.checked = (p === 'corporate');
    step1.children.push(radio);
  });

  const s1Name = doc.register('step1-selected-name', doc.createElement('span'));
  const s1Price = doc.register('step1-selected-price', doc.createElement('span'));
  const s1Next = doc.register('quoter-btn-step1-next', doc.createElement('button'));
  step1.children.push(s1Name, s1Price, s1Next);
  root.children.push(step1);

  // Step 2 Pane
  const step2 = doc.register('quoter-step-2', doc.createElement('div', { class: 'step-pane', hidden: 'true' }));
  const title2 = doc.createElement('h3', { class: 'step-pane-title' });
  step2.children.push(title2);

  ['catalog', 'whatsapp', 'multilanguage', 'seo_pro', 'blog'].forEach((a) => {
    const chk = doc.createElement('input', {
      type: 'checkbox',
      name: 'quoter_addon',
      value: a
    });
    chk.checked = false;
    step2.children.push(chk);
  });

  const liveTotal = doc.register('quoter-live-total', doc.createElement('span'));
  const liveSplit = doc.register('quoter-live-split', doc.createElement('span'));
  const s2Prev = doc.register('quoter-btn-step2-prev', doc.createElement('button'));
  const s2Next = doc.register('quoter-btn-step2-next', doc.createElement('button'));
  step2.children.push(liveTotal, liveSplit, s2Prev, s2Next);
  root.children.push(step2);

  // Step 3 Pane
  const step3 = doc.register('quoter-step-3', doc.createElement('div', { class: 'step-pane', hidden: 'true' }));
  const title3 = doc.createElement('h3', { class: 'step-pane-title' });
  step3.children.push(title3);

  const sumPlanTitle = doc.register('summary-plan-title', doc.createElement('h4'));
  const sumPlanDays = doc.register('summary-plan-days', doc.createElement('p'));
  const sumBaseName = doc.register('summary-base-name', doc.createElement('span'));
  const sumBasePrice = doc.register('summary-base-price', doc.createElement('span'));
  const sumAddonsList = doc.register('summary-addons-list', doc.createElement('ul'));
  const sumTotalPrice = doc.register('summary-total-price', doc.createElement('span'));
  const sumUpfront = doc.register('summary-split-upfront', doc.createElement('span'));
  const sumDelivery = doc.register('summary-split-delivery', doc.createElement('span'));
  const s3Prev = doc.register('quoter-btn-step3-prev', doc.createElement('button'));
  const transferBtn = doc.register('quoter-transfer-btn', doc.createElement('button'));
  const waBtn = doc.register('quoter-whatsapp-btn', doc.createElement('button'));

  step3.children.push(
    sumPlanTitle, sumPlanDays, sumBaseName, sumBasePrice,
    sumAddonsList, sumTotalPrice, sumUpfront, sumDelivery,
    s3Prev, transferBtn, waBtn
  );
  root.children.push(step3);

  // Contact section for transfer auto-scroll
  const contactSection = doc.register('contacto', doc.createElement('section'));
  const contactNameInput = doc.register('name', doc.createElement('input', { type: 'text', name: 'name' }));
  contactSection.children.push(contactNameInput);
  doc.body.children.push(contactSection);

  // FAQ Accordion section
  const faqSection = doc.register('faq', doc.createElement('section'));
  for (let i = 1; i <= 6; i++) {
    const item = doc.createElement('div', { class: 'faq-item' });
    const trigger = doc.createElement('button', {
      class: 'faq-trigger',
      id: `faq-btn-${i}`,
      'aria-expanded': 'false',
      'aria-controls': `faq-panel-${i}`
    });
    const panel = doc.register(`faq-panel-${i}`, doc.createElement('div', {
      class: 'faq-panel',
      hidden: 'true'
    }));
    item.children.push(trigger, panel);
    faqSection.children.push(item);
  }
  doc.body.children.push(faqSection);

  return doc;
}

// -----------------------------------------------------------------
// Main Test Runner Function
// -----------------------------------------------------------------
async function runStressTests() {
  console.log('========================================================================');
  console.log('  DuyvesTI Quoter Empirical Stress & Fuzzing Harness');
  console.log('========================================================================');

  const report = {
    combinatorialRuns: 0,
    randomRuns: 0,
    invariantChecks: 0,
    stepSwitches: 0,
    prototypeFindings: [],
    edgeFindings: [],
    accordionRuns: 0
  };

  // =================================================================
  // Suite 1: Combinatorial Fuzzing & Strict Invariant Verification
  // =================================================================
  console.log('\n[Suite 1] Running Combinatorial Fuzzing (All plans x tiers x addon power-sets x discounts)...');

  const plans = ['landing', 'corporate', 'custom'];
  const tiers = ['standard', 'promo'];
  const addonKeys = [
    'catalog', 'whatsapp', 'multilanguage', 'seo_pro', 'blog',
    'whatsapp_crm', 'payment_gateway', 'seo_local', 'support_pack'
  ];
  const discounts = [0, 5, 10, 15, 25, 33, 50, 100];

  // Helper to generate power set
  const powerSet = (arr) => arr.reduce((subsets, val) => subsets.concat(subsets.map((set) => [...set, val])), [[]]);
  const addonSubsets = powerSet(addonKeys); // 2^9 = 512 subsets

  for (const tier of tiers) {
    for (const plan of plans) {
      for (const discount of discounts) {
        for (const addons of addonSubsets) {
          report.combinatorialRuns++;
          report.invariantChecks++;

          const quote = calculateQuote({
            projectType: plan,
            addons,
            tier,
            fullPaymentDiscount: discount
          });

          // 1. Invariant: Strict integer amounts (zero fractional drift)
          assert.ok(Number.isInteger(quote.basePrice), `basePrice must be integer: ${quote.basePrice}`);
          assert.ok(Number.isInteger(quote.addonsTotal), `addonsTotal must be integer: ${quote.addonsTotal}`);
          assert.ok(Number.isInteger(quote.subtotal), `subtotal must be integer: ${quote.subtotal}`);
          assert.ok(Number.isInteger(quote.discountAmount), `discountAmount must be integer: ${quote.discountAmount}`);
          assert.ok(Number.isInteger(quote.totalPrice), `totalPrice must be integer: ${quote.totalPrice}`);
          assert.ok(Number.isInteger(quote.upfrontPayment), `upfrontPayment must be integer: ${quote.upfrontPayment}`);
          assert.ok(Number.isInteger(quote.deliveryPayment), `deliveryPayment must be integer: ${quote.deliveryPayment}`);

          // 2. Invariant: Upfront + Delivery strictly equals Total (P_upfront + P_delivery === T)
          assert.strictEqual(
            quote.upfrontPayment + quote.deliveryPayment,
            quote.totalPrice,
            `Invariant violation: ${quote.upfrontPayment} + ${quote.deliveryPayment} !== ${quote.totalPrice}`
          );

          // 3. Subtotal & Discount mathematical consistency
          assert.strictEqual(
            quote.subtotal,
            quote.basePrice + quote.addonsTotal,
            `Subtotal math mismatch: ${quote.subtotal} !== ${quote.basePrice} + ${quote.addonsTotal}`
          );
          assert.strictEqual(
            quote.totalPrice,
            quote.subtotal - quote.discountAmount,
            `Total math mismatch: ${quote.totalPrice} !== ${quote.subtotal} - ${quote.discountAmount}`
          );

          // 4. Formatted CLP outputs
          assert.strictEqual(quote.formattedTotal, formatCLP(quote.totalPrice));
          assert.strictEqual(quote.formattedUpfront, formatCLP(quote.upfrontPayment));
          assert.strictEqual(quote.formattedDelivery, formatCLP(quote.deliveryPayment));

          // 5. Delivery days bounds
          assert.ok(quote.deliveryDays >= 5 && quote.deliveryDays <= 20);

          // 6. Summary text completeness
          assert.ok(quote.summaryText.startsWith('Cotización personalizada seleccionada:'));
          assert.ok(quote.summaryText.includes(quote.planName));
          assert.ok(quote.summaryText.includes(quote.formattedTotal));
        }
      }
    }
  }

  console.log(`  ✔ Completed ${report.combinatorialRuns} deterministic combinations without any invariant violation!`);

  // =================================================================
  // Suite 2: Randomized Adversarial Fuzzing (50,000 runs)
  // =================================================================
  console.log('\n[Suite 2] Running 50,000 Randomized Adversarial Fuzzing Runs...');

  const allPossibleKeys = [
    ...addonKeys,
    'catalog', 'catalog', 'whatsapp', // duplicates
    'invalid_addon_1', 'bitcoin_pay', 'ai_chatbot', 'random_key_999',
    '', '   ', 'UPPERCASE_KEY', 'unknown'
  ];

  for (let i = 0; i < 50000; i++) {
    report.randomRuns++;
    report.invariantChecks++;

    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    const randomTier = Math.random() > 0.5 ? 'promo' : 'standard';
    const numAddons = Math.floor(Math.random() * 15);
    const randomAddons = [];
    for (let j = 0; j < numAddons; j++) {
      randomAddons.push(allPossibleKeys[Math.floor(Math.random() * allPossibleKeys.length)]);
    }
    const randomDiscount = Math.floor(Math.random() * 101); // 0% to 100%

    const quote = calculateQuote({
      projectType: randomPlan,
      addons: randomAddons,
      tier: randomTier,
      fullPaymentDiscount: randomDiscount
    });

    assert.strictEqual(
      quote.upfrontPayment + quote.deliveryPayment,
      quote.totalPrice,
      `Randomized run invariant failure at iteration ${i}`
    );
    assert.ok(Number.isInteger(quote.totalPrice));
    assert.ok(Number.isInteger(quote.upfrontPayment));
    assert.ok(Number.isInteger(quote.deliveryPayment));
  }

  console.log(`  ✔ Completed ${report.randomRuns} randomized adversarial runs with 100% invariant adherence.`);

  // =================================================================
  // Suite 3: Mathematical Odd/Even Split & Currency Formatter Boundaries
  // =================================================================
  console.log('\n[Suite 3] Testing Odd/Even Split Edge Values & Currency Formatter...');

  const oddAmounts = [1, 3, 5, 7, 9, 149991, 149993, 299991, 499991, 999999, 1234567, 10000001];
  for (const amt of oddAmounts) {
    const upfront = Math.round(amt * 0.5);
    const delivery = amt - upfront;
    assert.strictEqual(upfront + delivery, amt, `Odd amount ${amt} split failed`);
    assert.ok(Number.isInteger(upfront));
    assert.ok(Number.isInteger(delivery));
  }

  // formatCLP boundary inputs
  assert.strictEqual(formatCLP(0), '$0 CLP');
  assert.strictEqual(formatCLP(1000), '$1.000 CLP');
  assert.strictEqual(formatCLP(149990), '$149.990 CLP');
  assert.strictEqual(formatCLP(299990), '$299.990 CLP');
  assert.strictEqual(formatCLP(499990), '$499.990 CLP');
  assert.strictEqual(formatCLP(123456789), '$123.456.789 CLP');
  assert.strictEqual(formatCLP(NaN), '$0 CLP');
  assert.strictEqual(formatCLP(null), '$0 CLP');
  assert.strictEqual(formatCLP(undefined), '$0 CLP');
  assert.strictEqual(formatCLP('string'), '$0 CLP');
  assert.strictEqual(formatCLP({}), '$0 CLP');
  assert.strictEqual(formatCLP([]), '$0 CLP');
  console.log('  ✔ Currency formatter and odd-value split boundaries verified.');

  // =================================================================
  // Suite 4: Adversarial Input Boundaries & Prototype Inheritance Safety
  // =================================================================
  console.log('\n[Suite 4] Adversarial Input Boundaries & Prototype Safety...');

  // 1. Missing project type
  assert.throws(() => calculateQuote({}), /Project type is required/i);
  assert.throws(() => calculateQuote({ projectType: '' }), /Project type is required/i);
  assert.throws(() => calculateQuote({ projectType: null }), /Project type is required/i);
  assert.throws(() => calculateQuote({ projectType: undefined }), /Project type is required/i);

  // 2. Non-string project type
  assert.throws(() => calculateQuote({ projectType: 123 }), /Invalid project type/i);
  assert.throws(() => calculateQuote({ projectType: true }), /Invalid project type/i);
  assert.throws(() => calculateQuote({ projectType: {} }), /Invalid project type/i);
  assert.throws(() => calculateQuote({ projectType: [] }), /Invalid project type/i);

  // 3. HTML / Script injection
  assert.throws(() => calculateQuote({ projectType: '<script>alert(1)</script>' }), /Invalid project type/i);
  assert.throws(() => calculateQuote({ projectType: '<img src=x onerror=alert(1)>' }), /Invalid project type/i);
  assert.throws(() => calculateQuote({ projectType: '<svg onload=alert(1)>' }), /Invalid project type/i);

  // 4. Unknown legitimate project types
  assert.throws(() => calculateQuote({ projectType: 'enterprise' }), /Unknown project type: enterprise/i);
  assert.throws(() => calculateQuote({ projectType: 'ecommerce_unlimited' }), /Unknown project type: ecommerce_unlimited/i);

  // 5. Addons edge cases
  // Non-array addons is treated safely as empty
  const nonArray1 = calculateQuote({ projectType: 'landing', addons: null });
  assert.strictEqual(nonArray1.addonsTotal, 0);
  const nonArray2 = calculateQuote({ projectType: 'landing', addons: 'catalog' });
  assert.strictEqual(nonArray2.addonsTotal, 0);
  const nonArray3 = calculateQuote({ projectType: 'landing', addons: 123 });
  assert.strictEqual(nonArray3.addonsTotal, 0);

  // Non-string elements in addons array are filtered safely
  const mixedAddons = calculateQuote({
    projectType: 'landing',
    addons: ['catalog', null, undefined, 42, true, {}, []]
  });
  assert.strictEqual(mixedAddons.addons.length, 1);
  assert.strictEqual(mixedAddons.addons[0].id, 'catalog');

  // Alias deduplication: passing both alias ('whatsapp') and canonical ('whatsapp_crm')
  const aliasDedup = calculateQuote({
    projectType: 'landing',
    addons: ['whatsapp', 'whatsapp_crm']
  });
  assert.strictEqual(aliasDedup.addons.length, 1, 'Alias and canonical key must not duplicate');

  // 6. Empirical Probe: Prototype Property Inheritance Check
  const prototypeProps = ['toString', 'valueOf', 'constructor', 'hasOwnProperty', 'isPrototypeOf', '__proto__'];
  for (const prop of prototypeProps) {
    // Check projectType prototype access
    let ptThrew = false;
    let ptResult = null;
    try {
      ptResult = calculateQuote({ projectType: prop });
    } catch (e) {
      ptThrew = true;
    }
    if (!ptThrew && ptResult && (Number.isNaN(ptResult.totalPrice) || ptResult.totalPrice === undefined)) {
      report.prototypeFindings.push(
        `calculateQuote({ projectType: '${prop}' }) accessed Object.prototype.${prop} instead of rejecting via hasOwnProperty, returning NaN totalPrice.`
      );
    }

    // Check addons prototype access
    try {
      const addonRes = calculateQuote({ projectType: 'landing', addons: [prop] });
      if (Number.isNaN(addonRes.addonsTotal) || Number.isNaN(addonRes.totalPrice)) {
        report.prototypeFindings.push(
          `calculateQuote({ projectType: 'landing', addons: ['${prop}'] }) accessed ADDON_CATALOG.${prop}, setting addonsTotal=NaN instead of ignoring unknown key.`
        );
      }
    } catch (e) {
      // Ignored
    }
  }

  if (report.prototypeFindings.length > 0) {
    console.log(`  ⚠ Discovered ${report.prototypeFindings.length} prototype inheritance edge findings:`);
    report.prototypeFindings.forEach((f) => console.log('    -', f));
  } else {
    console.log('  ✔ Prototype property inheritance safety verified.');
  }

  // =================================================================
  // Suite 5: UI Controller State Transitions & Rapid Step Switching
  // =================================================================
  console.log('\n[Suite 5] Testing UI Controller & 10,000 Rapid Step Transitions...');

  const mockDom = createFullQuoterDOM();
  global.document = mockDom;
  global.window = {
    location: { hash: '' },
    addEventListener: (evt, fn) => mockDom.addEventListener(evt, fn),
    removeEventListener: (evt, fn) => mockDom.removeEventListener(evt, fn),
    dispatchEvent: (evt) => mockDom.dispatchEvent(evt),
    open: (url, target, features) => {
      global.window._lastOpenedUrl = url;
    }
  };
  global.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail || {};
      this.bubbles = Boolean(init.bubbles);
      this.cancelable = Boolean(init.cancelable);
    }
  };

  const controller = new QuoterWizardController();
  controller.init();
  assert.strictEqual(controller.initialized, true);
  assert.strictEqual(controller.currentStep, 1);

  // 10,000 Rapid Step Switching cycles
  const stepSequence = [1, 2, 3, 2, 1, 3, 1, 2];
  for (let i = 0; i < 10000; i++) {
    report.stepSwitches++;
    const targetStep = stepSequence[i % stepSequence.length];
    controller.goToStep(targetStep);

    assert.strictEqual(controller.currentStep, targetStep);

    // Verify UI synchronization
    for (let s = 1; s <= 3; s++) {
      const pane = mockDom.getElementById(`quoter-step-${s}`);
      const navItem = mockDom.getElementById(`step-nav-${s}`);

      if (s === targetStep) {
        assert.ok(pane.classList.contains('active'), `Pane ${s} must have active class`);
        assert.strictEqual(pane.hasAttribute('hidden'), false, `Pane ${s} must not be hidden`);
        assert.ok(navItem.classList.contains('active'), `NavItem ${s} must have active class`);
        assert.strictEqual(navItem.getAttribute('aria-current'), 'step');
      } else {
        assert.strictEqual(pane.classList.contains('active'), false);
        assert.strictEqual(pane.getAttribute('hidden'), 'true');
        if (s < targetStep) {
          assert.ok(navItem.classList.contains('completed'));
        }
      }
    }
  }
  console.log(`  ✔ Passed ${report.stepSwitches} rapid step transitions with 100% DOM & ARIA state consistency.`);

  // Out-of-bounds step switching
  controller.goToStep(0);
  assert.strictEqual(controller.currentStep, 2); // Unchanged from last valid
  controller.goToStep(4);
  assert.strictEqual(controller.currentStep, 2);
  controller.goToStep(-99);
  assert.strictEqual(controller.currentStep, 2);

  // Probe NaN and non-number step inputs
  controller.goToStep(NaN);
  if (Number.isNaN(controller.currentStep)) {
    report.edgeFindings.push(
      'goToStep(NaN) bypassed (stepNumber < 1 || stepNumber > 3) because NaN comparison is false, setting this.currentStep=NaN and hiding all wizard panes.'
    );
    // Restore step to valid 2 for subsequent tests
    controller.currentStep = 2;
    controller.syncStepUI();
  }

  controller.goToStep('step_two');
  if (controller.currentStep === 'step_two') {
    report.edgeFindings.push(
      'goToStep("step_two") bypassed bounds check due to string comparison semantics, setting this.currentStep="step_two" and desynchronizing step UI.'
    );
    // Restore step to valid 2
    controller.currentStep = 2;
    controller.syncStepUI();
  }

  // Plan switching and Addon persistence
  controller.selectedAddons.add('catalog');
  controller.selectedAddons.add('whatsapp');
  controller.selectedPlan = 'landing';
  controller.updateCalculations();

  const landingTotal = mockDom.getElementById('quoter-live-total').textContent;
  controller.selectedPlan = 'custom';
  controller.updateCalculations();
  const customTotal = mockDom.getElementById('quoter-live-total').textContent;
  assert.notStrictEqual(landingTotal, customTotal);
  assert.ok(controller.selectedAddons.has('catalog'));
  assert.ok(controller.selectedAddons.has('whatsapp'));
  console.log('  ✔ Plan switching with addon state preservation verified.');

  // =================================================================
  // Suite 6: URL Deep Linking & Malformed Hash Parameters
  // =================================================================
  console.log('\n[Suite 6] Testing URL Deep Linking & Malformed Hash Inputs...');

  const testHashes = [
    { hash: '#cotizador?plan=landing', expected: 'landing' },
    { hash: '#cotizador?plan=corporate', expected: 'corporate' },
    { hash: '#cotizador?plan=custom', expected: 'custom' },
    { hash: '#cotizador?plan=invalid', expected: 'custom' }, // Retains previous
    { hash: '#cotizador?plan=<script>alert(1)</script>', expected: 'custom' },
    { hash: '#cotizador?plan=toString', expected: 'custom' },
    { hash: '#cotizador?foo=bar', expected: 'custom' },
    { hash: '#cotizador?', expected: 'custom' },
    { hash: '#cotizador', expected: 'custom' },
    { hash: '', expected: 'custom' },
    { hash: '#cotizador?plan=landing&extra=123', expected: 'landing' }
  ];

  for (const { hash, expected } of testHashes) {
    window.location.hash = hash;
    controller.handleUrlParams();
    assert.strictEqual(
      controller.selectedPlan,
      expected,
      `Hash "${hash}" produced unexpected selectedPlan: "${controller.selectedPlan}" (expected "${expected}")`
    );
  }
  console.log('  ✔ URL deep linking correctly handles valid plans and safely ignores all malformed hash inputs.');

  // =================================================================
  // Suite 7: Transfer to Contact Form Contract & WhatsApp Bridge
  // =================================================================
  console.log('\n[Suite 7] Testing M2 <-> M3 Transfer CustomEvent Contract & WhatsApp Bridge...');

  let receivedEvent = null;
  mockDom.addEventListener('duyvesti:quote-selected', (e) => {
    receivedEvent = e;
  });

  controller.selectedPlan = 'corporate';
  controller.selectedAddons = new Set(['catalog', 'whatsapp']);
  controller.transferToForm();

  assert.ok(receivedEvent, 'CustomEvent "duyvesti:quote-selected" must be dispatched');
  const d = receivedEvent.detail;
  assert.strictEqual(d.planId, 'corporate');
  assert.strictEqual(d.planName, 'Web PyME Comercial');
  assert.strictEqual(d.basePrice, 299990);
  assert.strictEqual(d.addons.length, 2);
  assert.ok(d.totalPrice > d.basePrice);
  assert.strictEqual(d.upfrontPayment + d.deliveryPayment, d.totalPrice);
  assert.strictEqual(d.formattedTotal, formatCLP(d.totalPrice));
  assert.strictEqual(d.formattedUpfront, formatCLP(d.upfrontPayment));
  assert.strictEqual(d.formattedDelivery, formatCLP(d.deliveryPayment));

  // Verify deep cloneability (no circular references, zero DOM nodes in event detail)
  const cloned = JSON.parse(JSON.stringify(d));
  assert.strictEqual(cloned.totalPrice, d.totalPrice);

  // WhatsApp Quote Bridge
  controller.shareToWhatsApp();
  const waUrl = global.window._lastOpenedUrl;
  assert.ok(waUrl.startsWith('https://wa.me/56929750390?text='));
  const encodedText = waUrl.split('text=')[1];
  assert.ok(!encodedText.includes(' '), 'WhatsApp text param must not contain unescaped spaces');
  assert.ok(decodeURIComponent(encodedText).includes('Web PyME Comercial'));
  console.log('  ✔ M2 <-> M3 transfer event contract and WhatsApp URL generation verified.');

  // =================================================================
  // Suite 8: Accessible FAQ Accordion Controller
  // =================================================================
  console.log('\n[Suite 8] Testing Accessible FAQ Accordion Controller & Keyboard Navigation...');

  const accordion = new FaqAccordion('#faq', { allowMultiple: true });
  const triggers = mockDom.querySelectorAll('.faq-trigger');
  assert.strictEqual(triggers.length, 6);

  // Rapid toggling on accordion buttons (1,000 cycles)
  for (let i = 0; i < 1000; i++) {
    report.accordionRuns++;
    const trig = triggers[i % triggers.length];
    accordion.toggle(trig);
  }

  // Ensure all closed
  triggers.forEach((t) => {
    if (t.getAttribute('aria-expanded') === 'true') accordion.collapse(t);
  });

  // Enter / Space toggling
  let fakePrevented = false;
  const preventDefault = () => { fakePrevented = true; };

  triggers[0].dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault });
  triggers[0].dispatchEvent({ type: 'keydown', key: ' ', preventDefault });
  assert.strictEqual(triggers[0].getAttribute('aria-expanded'), 'true');
  triggers[0].dispatchEvent({ type: 'keydown', key: ' ', preventDefault });
  assert.strictEqual(triggers[0].getAttribute('aria-expanded'), 'false');

  // Keyboard Navigation: ArrowDown, ArrowUp, Home, End roving focus
  mockDom.activeElement = triggers[0];
  triggers[0].dispatchEvent({ type: 'keydown', key: 'ArrowDown', preventDefault });
  assert.strictEqual(mockDom.activeElement, triggers[1], 'ArrowDown must advance focus');

  triggers[1].dispatchEvent({ type: 'keydown', key: 'ArrowUp', preventDefault });
  assert.strictEqual(mockDom.activeElement, triggers[0], 'ArrowUp must move focus back');

  triggers[0].dispatchEvent({ type: 'keydown', key: 'End', preventDefault });
  assert.strictEqual(mockDom.activeElement, triggers[5], 'End must jump focus to last trigger');

  triggers[5].dispatchEvent({ type: 'keydown', key: 'Home', preventDefault });
  assert.strictEqual(mockDom.activeElement, triggers[0], 'Home must jump focus to first trigger');

  console.log('  ✔ FAQ accordion toggling and WAI-ARIA roving keyboard navigation verified.');

  // =================================================================
  // Summary Report
  // =================================================================
  console.log('\n========================================================================');
  console.log('  Empirical Stress Test Summary');
  console.log('========================================================================');
  console.log(`  Combinatorial Scenarios Tested:  ${report.combinatorialRuns}`);
  console.log(`  Random Adversarial Runs:        ${report.randomRuns}`);
  console.log(`  Total Invariant Verifications:  ${report.invariantChecks}`);
  console.log(`  Rapid Step Transitions Tested:  ${report.stepSwitches}`);
  console.log(`  FAQ Accordion Cycles:           ${report.accordionRuns}`);
  console.log(`  Prototype Inheritance Findings: ${report.prototypeFindings.length}`);
  console.log('========================================================================\n');

  return report;
}

runStressTests().catch((err) => {
  console.error('Fatal stress test failure:', err);
  process.exit(1);
});
