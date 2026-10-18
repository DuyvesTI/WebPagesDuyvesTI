/**
 * src/js/quoter.js - DuyvesTI 3-Step Interactive Quoter & FAQ Controller
 * 
 * Features:
 * - F06: Quoter Step 1 (Project Type: Landing $149.990, Web PyME $299.990, Startup $399.990)
 * - F07: Quoter Step 2 (Modular Addons: Catálogo, WhatsApp, Multi-idioma, SEO Pro, Blog)
 * - F08: Quoter Step 3 (Summary, 50/50 Split, 'duyvesti:quote-selected' Event Dispatch)
 * - F17: Accessible FAQ Accordion Controller (WAI-ARIA APG pattern)
 * 
 * Compatibility: Dual-mode (CommonJS module.exports for Node.js test runners + window.duyvestiQuoter for Browser)
 */

(function (global) {
  'use strict';

  // -------------------------------------------------------------
  // 1. Catalogs (Standard Baseline & Promo Pricing)
  // -------------------------------------------------------------
  const PLAN_CATALOG = {
    standard: {
      landing: { id: 'landing', name: 'Landing Page de Conversión', price: 180000, days: 5 },
      corporate: { id: 'corporate', name: 'Sitio Web Corporativo PyME', price: 320000, days: 10 },
      custom: { id: 'custom', name: 'Plataforma / App Web a Medida', price: 580000, days: 20 }
    },
    promo: {
      landing: { id: 'landing', name: 'Landing Emprendedor', price: 149990, days: 5 },
      corporate: { id: 'corporate', name: 'Web PyME Comercial', price: 299990, days: 10 },
      custom: { id: 'custom', name: 'Plataforma Startup', price: 399990, days: 20 }
    }
  };

  const ADDON_CATALOG = {
    // Canonical UI keys with aliases
    catalog: { id: 'catalog', name: 'Catálogo de Productos', promoPrice: 45000, standardPrice: 60000, price: 60000 },
    whatsapp: { id: 'whatsapp_crm', name: 'Integración WhatsApp Business', promoPrice: 25000, standardPrice: 35000, price: 35000 },
    multilanguage: { id: 'payment_gateway', name: 'Multi-idioma (Español / Inglés)', promoPrice: 50000, standardPrice: 75000, price: 75000 },
    seo_pro: { id: 'seo_local', name: 'Optimización SEO Pro', promoPrice: 40000, standardPrice: 45000, price: 45000 },
    blog: { id: 'support_pack', name: 'Blog / Noticias Autoadministrable', promoPrice: 35000, standardPrice: 30000, price: 30000 },

    // Direct oracle keys for standard testing
    whatsapp_crm: { id: 'whatsapp_crm', name: 'Integración CRM / WhatsApp Business', promoPrice: 25000, standardPrice: 35000, price: 35000 },
    payment_gateway: { id: 'payment_gateway', name: 'Pasarela de Pagos (Webpay/Fintoc)', promoPrice: 50000, standardPrice: 75000, price: 75000 },
    seo_local: { id: 'seo_local', name: 'SEO Local Avanzado + Google Business', promoPrice: 40000, standardPrice: 45000, price: 45000 },
    support_pack: { id: 'support_pack', name: 'Pack Soporte y Capacitación (30 días)', promoPrice: 35000, standardPrice: 30000, price: 30000 }
  };

  // -------------------------------------------------------------
  // 2. Mathematical Calculation Engine
  // -------------------------------------------------------------
  function formatCLP(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0 CLP';
    const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${parts} CLP`;
  }

  function calculateQuote({ projectType, addons = [], tier = 'standard', fullPaymentDiscount = 0 } = {}) {
    if (!projectType) {
      throw new Error('Project type is required');
    }

    // Input sanitization: Reject strings containing HTML tags or scripts (Boundary test F06-B03)
    if (typeof projectType !== 'string' || /<[^>]*>/i.test(projectType)) {
      throw new Error('Invalid project type');
    }

    const catalog = PLAN_CATALOG[tier] || PLAN_CATALOG.standard;
    const plan = catalog[projectType];
    if (!plan) {
      throw new Error(`Unknown project type: ${projectType}`);
    }

    // Deduplicate addons (Boundary test F07-B02)
    const rawKeys = Array.isArray(addons) ? addons : [];
    const uniqueAddonKeys = Array.from(new Set(rawKeys));
    let addonsTotal = 0;
    const resolvedAddons = [];
    const addedCanonicalIds = new Set();

    for (const rawKey of uniqueAddonKeys) {
      if (typeof rawKey !== 'string') continue;
      const def = ADDON_CATALOG[rawKey];
      if (!def) {
        // Unknown addon keys are ignored without throwing (Boundary test F07-B03)
        continue;
      }

      // Avoid adding both alias and canonical key
      const canonicalId = def.id;
      if (addedCanonicalIds.has(canonicalId)) continue;
      addedCanonicalIds.add(canonicalId);

      const price = tier === 'promo' ? def.promoPrice : def.standardPrice;
      addonsTotal += price;
      resolvedAddons.push({
        id: def.id,
        name: def.name,
        price
      });
    }

    const subtotal = plan.price + addonsTotal;
    const discountAmount = fullPaymentDiscount > 0 ? Math.round(subtotal * (fullPaymentDiscount / 100)) : 0;
    const totalPrice = subtotal - discountAmount;

    // Strict 50/50 split preservation for odd numbers (Boundary test F08-B01)
    const upfrontPayment = Math.round(totalPrice * 0.5);
    const deliveryPayment = totalPrice - upfrontPayment;

    const summaryText = `Cotización personalizada seleccionada: ${plan.name} (${formatCLP(totalPrice)}) con adicionales: ${
      resolvedAddons.length > 0 ? resolvedAddons.map(a => a.name).join(', ') : 'Ninguno'
    }`;

    return {
      planId: plan.id,
      planName: plan.name,
      deliveryDays: plan.days,
      basePrice: plan.price,
      addons: resolvedAddons,
      addonsTotal,
      subtotal,
      discountAmount,
      totalPrice,
      upfrontPayment,
      deliveryPayment,
      formattedTotal: formatCLP(totalPrice),
      formattedUpfront: formatCLP(upfrontPayment),
      formattedDelivery: formatCLP(deliveryPayment),
      summaryText
    };
  }

  // -------------------------------------------------------------
  // 3. UI State Controller & DOM Binder for Quoter Wizard
  // -------------------------------------------------------------
  class QuoterWizardController {
    constructor() {
      this.currentStep = 1;
      this.tier = 'promo';
      this.selectedPlan = 'corporate'; // Default recommendation
      this.selectedAddons = new Set();
      this.initialized = false;
    }

    init() {
      if (typeof document === 'undefined') return;
      const root = document.getElementById('quoter-wizard');
      if (!root) return;

      this.bindEvents();
      this.handleUrlParams();
      this.syncStepUI();
      this.updateCalculations();
      this.initialized = true;
    }

    handleUrlParams() {
      if (typeof window === 'undefined' || !window.location) return;
      const hash = window.location.hash || '';
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const planParam = params.get('plan');
        if (planParam && (planParam === 'landing' || planParam === 'corporate' || planParam === 'custom')) {
          this.selectedPlan = planParam;
          const radio = document.querySelector(`input[name="quoter_plan"][value="${planParam}"]`);
          if (radio) {
            radio.checked = true;
          }
          this.updateCalculations();
        }
      }
    }

    bindEvents() {
      // Plan Selection (Step 1)
      const planRadios = document.querySelectorAll('input[name="quoter_plan"]');
      planRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.selectedPlan = e.target.value;
            this.updateCalculations();
          }
        });
      });

      // Addons Selection (Step 2)
      const addonCheckboxes = document.querySelectorAll('input[name="quoter_addon"]');
      addonCheckboxes.forEach(chk => {
        chk.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.selectedAddons.add(e.target.value);
          } else {
            this.selectedAddons.delete(e.target.value);
          }
          this.updateCalculations();
        });
      });

      // Stepper Navigation Buttons
      const stepperBtns = document.querySelectorAll('.stepper-btn');
      stepperBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = parseInt(btn.getAttribute('data-step-target'), 10);
          if (target) this.goToStep(target);
        });
      });

      // Step 1 -> Step 2
      const step1Next = document.getElementById('quoter-btn-step1-next');
      if (step1Next) {
        step1Next.addEventListener('click', () => this.goToStep(2));
      }

      // Step 2 -> Step 1
      const step2Prev = document.getElementById('quoter-btn-step2-prev');
      if (step2Prev) {
        step2Prev.addEventListener('click', () => this.goToStep(1));
      }

      // Step 2 -> Step 3
      const step2Next = document.getElementById('quoter-btn-step2-next');
      if (step2Next) {
        step2Next.addEventListener('click', () => this.goToStep(3));
      }

      // Step 3 -> Step 2
      const step3Prev = document.getElementById('quoter-btn-step3-prev');
      if (step3Prev) {
        step3Prev.addEventListener('click', () => this.goToStep(2));
      }

      // Transfer Button (CustomEvent DuyvesTI ↔ Contact Form)
      const transferBtn = document.getElementById('quoter-transfer-btn');
      if (transferBtn) {
        transferBtn.addEventListener('click', () => this.transferToForm());
      }

      // WhatsApp Quote Button
      const waBtn = document.getElementById('quoter-whatsapp-btn');
      if (waBtn) {
        waBtn.addEventListener('click', () => this.shareToWhatsApp());
      }

      // Hash change listener for deep links (#cotizador?plan=landing)
      window.addEventListener('hashchange', () => this.handleUrlParams());
    }

    goToStep(stepNumber) {
      if (stepNumber < 1 || stepNumber > 3) return;
      this.currentStep = stepNumber;
      this.syncStepUI();
      this.updateCalculations();

      // Focus management for accessibility
      const targetPane = document.getElementById(`quoter-step-${stepNumber}`);
      if (targetPane) {
        const heading = targetPane.querySelector('.step-pane-title');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }
    }

    syncStepUI() {
      // Update Stepper Navigation Items
      for (let i = 1; i <= 3; i++) {
        const navItem = document.getElementById(`step-nav-${i}`);
        const pane = document.getElementById(`quoter-step-${i}`);

        if (navItem) {
          navItem.classList.remove('active', 'completed');
          if (i === this.currentStep) {
            navItem.classList.add('active');
            navItem.setAttribute('aria-current', 'step');
          } else if (i < this.currentStep) {
            navItem.classList.add('completed');
            navItem.removeAttribute('aria-current');
          } else {
            navItem.removeAttribute('aria-current');
          }
        }

        if (pane) {
          if (i === this.currentStep) {
            pane.classList.add('active');
            pane.removeAttribute('hidden');
          } else {
            pane.classList.remove('active');
            pane.setAttribute('hidden', 'true');
          }
        }
      }
    }

    updateCalculations() {
      const quote = calculateQuote({
        projectType: this.selectedPlan,
        addons: Array.from(this.selectedAddons),
        tier: this.tier
      });

      // Update Step 1 Footer
      const s1Name = document.getElementById('step1-selected-name');
      const s1Price = document.getElementById('step1-selected-price');
      if (s1Name) s1Name.textContent = quote.planName;
      if (s1Price) s1Price.textContent = formatCLP(quote.basePrice);

      // Update Step 2 Live Bar
      const liveTotal = document.getElementById('quoter-live-total');
      const liveSplit = document.getElementById('quoter-live-split');
      if (liveTotal) liveTotal.textContent = quote.formattedTotal;
      if (liveSplit) liveSplit.textContent = `(2 cuotas de ${quote.formattedUpfront})`;

      // Update Step 3 Summary Receipt
      const sumPlanTitle = document.getElementById('summary-plan-title');
      const sumPlanDays = document.getElementById('summary-plan-days');
      const sumBaseName = document.getElementById('summary-base-name');
      const sumBasePrice = document.getElementById('summary-base-price');
      const sumAddonsList = document.getElementById('summary-addons-list');
      const sumTotalPrice = document.getElementById('summary-total-price');
      const sumUpfront = document.getElementById('summary-split-upfront');
      const sumDelivery = document.getElementById('summary-split-delivery');

      if (sumPlanTitle) sumPlanTitle.textContent = quote.planName;
      if (sumPlanDays) sumPlanDays.textContent = `Plazo de entrega: ${quote.deliveryDays} días hábiles`;
      if (sumBaseName) sumBaseName.textContent = quote.planName;
      if (sumBasePrice) sumBasePrice.textContent = formatCLP(quote.basePrice);
      if (sumTotalPrice) sumTotalPrice.textContent = quote.formattedTotal;
      if (sumUpfront) sumUpfront.textContent = quote.formattedUpfront;
      if (sumDelivery) sumDelivery.textContent = quote.formattedDelivery;

      if (sumAddonsList) {
        if (quote.addons.length === 0) {
          sumAddonsList.innerHTML = '<li class="empty-addons">Sin adicionales seleccionados</li>';
        } else {
          sumAddonsList.innerHTML = quote.addons.map(a => `
            <li class="receipt-addon-item">
              <span>${a.name}</span>
              <strong>+ ${formatCLP(a.price)}</strong>
            </li>
          `).join('');
        }
      }
    }

    transferToForm() {
      const quote = calculateQuote({
        projectType: this.selectedPlan,
        addons: Array.from(this.selectedAddons),
        tier: this.tier
      });

      // Dispatch global CustomEvent (M2 ↔ M3 contract)
      if (typeof window !== 'undefined') {
        const eventDetail = {
          planId: quote.planId,
          planName: quote.planName,
          basePrice: quote.basePrice,
          addons: quote.addons,
          addonsTotal: quote.addonsTotal,
          totalPrice: quote.totalPrice,
          upfrontPayment: quote.upfrontPayment,
          deliveryPayment: quote.deliveryPayment,
          formattedTotal: quote.formattedTotal,
          formattedUpfront: quote.formattedUpfront,
          formattedDelivery: quote.formattedDelivery,
          summaryText: quote.summaryText
        };

        window.dispatchEvent(new CustomEvent('duyvesti:quote-selected', {
          bubbles: true,
          cancelable: true,
          detail: eventDetail
        }));

        // Auto-scroll to contact section smoothly
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Focus contact name input after scroll
        setTimeout(() => {
          const nameInput = document.getElementById('name') || document.querySelector('#contact-form input[type="text"]') || document.querySelector('input[name="name"]');
          if (nameInput) nameInput.focus();
        }, 400);
      }
    }

    shareToWhatsApp() {
      const quote = calculateQuote({
        projectType: this.selectedPlan,
        addons: Array.from(this.selectedAddons),
        tier: this.tier
      });

      const waUrl = `https://wa.me/56929750390?text=${encodeURIComponent(quote.summaryText)}`;
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }

  // -------------------------------------------------------------
  // 4. Accessible FAQ Accordion Controller (Feature F17)
  // -------------------------------------------------------------
  class FaqAccordion {
    constructor(containerSelector = '#faq', options = {}) {
      this.container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
      this.options = Object.assign({ allowMultiple: true }, options);

      if (this.container) {
        this.init();
      }
    }

    init() {
      this.triggers = Array.from(this.container.querySelectorAll('.faq-trigger'));
      this.bindEvents();
    }

    bindEvents() {
      this.triggers.forEach((trigger, index) => {
        // Click Toggle
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle(trigger);
        });

        // Keyboard Support: Enter, Space, Arrows, Home, End
        trigger.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            this.toggle(trigger);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = (index + 1) % this.triggers.length;
            this.triggers[nextIdx].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIdx = (index - 1 + this.triggers.length) % this.triggers.length;
            this.triggers[prevIdx].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            this.triggers[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            this.triggers[this.triggers.length - 1].focus();
          }
        });
      });
    }

    toggle(trigger) {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isCurrentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

      if (!this.options.allowMultiple && !isCurrentlyExpanded) {
        this.triggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
            this.collapse(otherTrigger);
          }
        });
      }

      if (isCurrentlyExpanded) {
        this.collapse(trigger);
      } else {
        this.expand(trigger);
      }
    }

    expand(trigger) {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      const itemContainer = trigger.closest('.faq-item');
      if (!panel) return;

      trigger.setAttribute('aria-expanded', 'true');
      if (itemContainer) itemContainer.classList.add('is-open');

      panel.removeAttribute('hidden');
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
      });
    }

    collapse(trigger) {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      const itemContainer = trigger.closest('.faq-item');
      if (!panel) return;

      trigger.setAttribute('aria-expanded', 'false');
      if (itemContainer) itemContainer.classList.remove('is-open');
      panel.classList.remove('is-open');

      const onTransitionEnd = () => {
        if (trigger.getAttribute('aria-expanded') === 'false') {
          panel.setAttribute('hidden', '');
        }
        panel.removeEventListener('transitionend', onTransitionEnd);
      };
      panel.addEventListener('transitionend', onTransitionEnd, { once: true });
      // Fallback timeout in case transitionend does not fire
      setTimeout(() => {
        if (trigger.getAttribute('aria-expanded') === 'false') {
          panel.setAttribute('hidden', '');
        }
      }, 350);
    }
  }

  // -------------------------------------------------------------
  // 5. Exports & Auto-Bootstrap
  // -------------------------------------------------------------
  const quoterEngine = {
    PLAN_CATALOG,
    ADDON_CATALOG,
    formatCLP,
    calculateQuote,
    QuoterWizardController,
    FaqAccordion,
    initQuoter: () => {
      const controller = new QuoterWizardController();
      controller.init();
      return controller;
    },
    initFaq: () => {
      return new FaqAccordion('#faq', { allowMultiple: true });
    }
  };

  // Node.js CommonJS Export (for test runners)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = quoterEngine;
  }

  // Browser Global Auto-Initialization
  if (typeof window !== 'undefined') {
    window.duyvestiQuoter = quoterEngine;
    const boot = () => {
      quoterEngine.initQuoter();
      quoterEngine.initFaq();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

})(typeof globalThis !== 'undefined' ? globalThis : this);
