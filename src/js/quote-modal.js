/**
 * src/js/quote-modal.js - Interactive Project Quote Modal Controller
 *
 * Opens a responsive modal when the user clicks "Cotizar mi Proyecto" (or any quote CTA)
 * allowing them to fill out their contact details, project type, and requirements,
 * and dispatch the inquiry via WhatsApp or Corporate Email (mailto:).
 *
 * Security & Anti-Bot Protections (Feature F22):
 * 1. Hidden Honeypot Field (#qm-fax-hp / organization_fax_hp): Silently intercepts spambots.
 * 2. Time-Delta Bot Gate (>= 2500ms): Blocks automated instant form-submission scripts.
 * 3. Submission Cooldown Rate-Limiter: Prevents rapid-fire automated spam dispatches.
 * 4. Strict Input Sanitization (XSS & SQLi neutralization): Strips HTML tags, scripts,
 *    event handlers, and SQL injection vectors before building the dispatch payload.
 */

(function (global) {
  'use strict';

  function sanitizeText(input) {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/(\b(UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)\b|--)/gi, '')
      .trim();
  }

  function hasMaliciousPayload(input) {
    if (!input || typeof input !== 'string') return false;
    return /<\s*script|javascript\s*:|on(error|load|mouseover|focus)\s*=|\b(UNION\s+SELECT|DROP\s+TABLE)\b/i.test(
      input
    );
  }

  class QuoteModalController {
    constructor(options = {}) {
      this.phone = options.phone || '56929750390';
      this.email = options.email || 'duyvesti@gmail.com';
      this.isOpen = false;
      this.previouslyFocused = null;
      this.openedAt = Date.now();
      this.lastSubmittedAt = 0;
      this.minHumanInteractionMs = options.minHumanInteractionMs || 2500;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.modal = document.getElementById('quote-project-modal');
      this.backdrop = document.getElementById('quote-modal-backdrop');
      this.closeBtn = document.getElementById('quote-modal-close');
      this.form = document.getElementById('quote-modal-form');
      this.btnWhatsApp = document.getElementById('quote-send-whatsapp');
      this.btnEmail = document.getElementById('quote-send-email');
      this.errorBanner = document.getElementById('quote-modal-error');

      // Inputs
      this.inputHoneypot = document.getElementById('qm-fax-hp');
      this.inputName = document.getElementById('qm-name');
      this.inputCompany = document.getElementById('qm-company');
      this.inputEmail = document.getElementById('qm-email');
      this.inputPhone = document.getElementById('qm-phone');
      this.inputPlan = document.getElementById('qm-plan');
      this.inputMessage = document.getElementById('qm-message');

      if (!this.modal) return;

      // Bind triggers across the page
      const triggers = document.querySelectorAll(
        '#hero-cta-quoter, [data-open-quote-modal], .pricing-card-footer a[href="#contacto"], .service-footer a[href="#contacto"], .portfolio-actions a[href="#contacto"]'
      );

      triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const presetPlan = trigger.getAttribute('data-plan') || this.inferPlanFromElement(trigger);
          this.open(presetPlan);
        });
      });

      // Close handlers
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.close();
        });
      }

      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Clear validation error on input
      [this.inputName, this.inputEmail, this.inputPhone, this.inputMessage].forEach((el) => {
        if (el) {
          el.addEventListener('input', () => this.hideError());
        }
      });

      // Action buttons
      if (this.btnWhatsApp) {
        this.btnWhatsApp.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleSend('whatsapp');
        });
      }

      if (this.btnEmail) {
        this.btnEmail.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleSend('email');
        });
      }

      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSend('whatsapp');
        });
      }
    }

    inferPlanFromElement(el) {
      const text = (el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '');
      if (/landing/i.test(text)) return 'Plan Landing Emprendedor ($149.990 CLP)';
      if (/pyme|corporativ/i.test(text)) return 'Plan Web PyME Comercial ($299.990 CLP)';
      if (/startup|medida|tienda|catálogo/i.test(text)) return 'Plan Plataforma Startup / A Medida (Desde $399.990 CLP)';
      if (/automatiz/i.test(text)) return 'Automatización e Integración de Datos';
      if (/protecci|ia\b/i.test(text)) return 'Protector de Datos Confidenciales / IA';
      return '';
    }

    open(presetPlan = '') {
      if (!this.modal) return;
      this.previouslyFocused = document.activeElement;
      this.isOpen = true;
      this.openedAt = Date.now();
      this.hideError();

      if (presetPlan && this.inputPlan) {
        for (let i = 0; i < this.inputPlan.options.length; i++) {
          if (this.inputPlan.options[i].value === presetPlan) {
            this.inputPlan.selectedIndex = i;
            break;
          }
        }
      }

      this.modal.removeAttribute('hidden');
      this.modal.setAttribute('aria-hidden', 'false');
      this.modal.classList.add('is-open');

      if (this.backdrop) {
        this.backdrop.removeAttribute('hidden');
        this.backdrop.classList.add('is-open');
      }

      document.body.classList.add('modal-open');

      setTimeout(() => {
        if (this.inputName) this.inputName.focus();
      }, 100);
    }

    close() {
      if (!this.isOpen || !this.modal) return;
      this.isOpen = false;

      this.modal.classList.remove('is-open');
      this.modal.setAttribute('aria-hidden', 'true');

      if (this.backdrop) {
        this.backdrop.classList.remove('is-open');
      }

      document.body.classList.remove('modal-open');

      setTimeout(() => {
        if (!this.isOpen) {
          this.modal.setAttribute('hidden', '');
          if (this.backdrop) this.backdrop.setAttribute('hidden', '');
        }
      }, 220);

      if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
        this.previouslyFocused.focus();
      }
    }

    showError(msg) {
      if (!this.errorBanner) return;
      this.errorBanner.textContent = msg;
      this.errorBanner.removeAttribute('hidden');
    }

    hideError() {
      if (!this.errorBanner) return;
      this.errorBanner.setAttribute('hidden', '');
      this.errorBanner.textContent = '';
    }

    /**
     * Evaluates anti-bot protections (Honeypot, Time-Delta >= 2500ms, Rate-Limit Cooldown)
     */
    isBotSubmission(now = Date.now()) {
      // 1. Honeypot trap check
      if (this.inputHoneypot && this.inputHoneypot.value && this.inputHoneypot.value.trim().length > 0) {
        return true;
      }

      // 2. Time-delta check (< 2500ms from modal open or negative/future clock anomaly)
      const elapsed = now - this.openedAt;
      if (elapsed < this.minHumanInteractionMs) {
        return true;
      }

      // 3. Rapid-fire rate limit (< 4000ms since last submission)
      if (this.lastSubmittedAt > 0 && now - this.lastSubmittedAt < 4000) {
        return true;
      }

      return false;
    }

    getFormData() {
      return {
        name: sanitizeText(this.inputName ? this.inputName.value : ''),
        company: sanitizeText(this.inputCompany ? this.inputCompany.value : ''),
        email: sanitizeText(this.inputEmail ? this.inputEmail.value : ''),
        phone: sanitizeText(this.inputPhone ? this.inputPhone.value : ''),
        plan: sanitizeText(this.inputPlan ? this.inputPlan.value : 'Plan Web PyME Comercial ($299.990 CLP)'),
        message: sanitizeText(this.inputMessage ? this.inputMessage.value : '')
      };
    }

    validate(data) {
      const rawInputs = [
        this.inputName ? this.inputName.value : '',
        this.inputCompany ? this.inputCompany.value : '',
        this.inputEmail ? this.inputEmail.value : '',
        this.inputPhone ? this.inputPhone.value : '',
        this.inputMessage ? this.inputMessage.value : ''
      ];

      if (rawInputs.some(hasMaliciousPayload)) {
        this.showError('Se detectaron caracteres no permitidos en el formulario. Por favor revisa los datos ingresados.');
        return false;
      }

      if (!data.name || data.name.length < 2) {
        this.showError('Por favor ingresa tu nombre para poder dirigirnos a ti.');
        if (this.inputName) this.inputName.focus();
        return false;
      }
      if (!data.email && !data.phone) {
        this.showError('Por favor ingresa tu teléfono o correo electrónico para responderte.');
        if (this.inputPhone) this.inputPhone.focus();
        return false;
      }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        this.showError('Por favor ingresa un correo electrónico válido (ej. nombre@empresa.cl).');
        if (this.inputEmail) this.inputEmail.focus();
        return false;
      }
      return true;
    }

    buildMessageText(data) {
      const lines = [
        '¡Hola DuyvesTI! 👋 Quiero cotizar un proyecto:',
        '',
        `• *Nombre:* ${data.name}`,
        data.company ? `• *Empresa / PyME:* ${data.company}` : null,
        data.phone ? `• *Teléfono:* ${data.phone}` : null,
        data.email ? `• *Correo:* ${data.email}` : null,
        `• *Servicio de interés:* ${data.plan}`,
        data.message ? `\n*Detalles del proyecto:*\n${data.message}` : null
      ].filter(Boolean);

      return lines.join('\n');
    }

    handleSend(channel) {
      const now = Date.now();

      // Silent anti-bot interception: close modal cleanly without opening WhatsApp/mailto
      if (this.isBotSubmission(now)) {
        this.close();
        return { blocked: true, isBot: true };
      }

      const data = this.getFormData();
      if (!this.validate(data)) return { blocked: true, isBot: false };

      this.lastSubmittedAt = now;
      const bodyText = this.buildMessageText(data);

      if (channel === 'whatsapp') {
        const waUrl = `https://wa.me/${this.phone}?text=${encodeURIComponent(bodyText)}`;
        if (typeof window !== 'undefined') {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }
      } else if (channel === 'email') {
        const subject = `Cotización Proyecto Web - ${data.company || data.name}`;
        const plainBody = bodyText.replace(/\*/g, '');
        const mailtoUrl = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
        if (typeof window !== 'undefined') {
          window.location.href = mailtoUrl;
        }
      }

      this.close();
      return { blocked: false, isBot: false };
    }
  }

  const exported = {
    QuoteModalController,
    sanitizeText,
    hasMaliciousPayload,
    initQuoteModal: (opts) => new QuoteModalController(opts)
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }

  if (typeof global !== 'undefined') {
    global.DuyvesTIQuoteModal = exported;
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new QuoteModalController());
      } else {
        new QuoteModalController();
      }
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
