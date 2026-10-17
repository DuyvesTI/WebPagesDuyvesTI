/**
 * src/js/whatsapp-chat.js - Interactive WhatsApp Chat Cloud Widget (Gamfire Pattern)
 *
 * Provides a conversational floating chat popover ("nube de chat") for WhatsApp:
 * - Toggles when user clicks the floating WhatsApp button (#whatsapp-fab).
 * - Welcomes PyME and Startup visitors with friendly, non-technical guidance.
 * - Offers interactive quick reply chips for instant quotes and common inquiries.
 * - Allows typing a custom message before jumping directly to WhatsApp.
 * - Fully accessible: keyboard navigation, focus management, and Escape key dismissal.
 */

(function (global) {
  'use strict';

  class WhatsAppChatController {
    constructor(options = {}) {
      this.phone = options.phone || '56929750390';
      this.defaultMessage = options.defaultMessage || '¡Hola DuyvesTI! Quiero consultar por el desarrollo de una página web para mi negocio.';
      this.isOpen = false;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.fab = document.getElementById('whatsapp-fab');
      this.cloud = document.getElementById('whatsapp-chat-cloud');
      this.closeBtn = document.getElementById('wa-chat-close-btn');
      this.form = document.getElementById('wa-chat-form');
      this.input = document.getElementById('wa-chat-input');
      this.sendBtn = document.getElementById('wa-chat-send-btn');
      this.timeEl = document.getElementById('wa-bubble-time');
      this.chips = document.querySelectorAll('.wa-chip');
      this.badge = document.querySelector('.whatsapp-fab-badge');

      if (!this.fab || !this.cloud) return;

      this.updateTimestamp();

      // Click on floating button opens/toggles the chat cloud
      this.fab.addEventListener('click', (e) => {
        // Prevent default navigation to display conversational cloud
        e.preventDefault();
        this.toggle();
      });

      // Close button handler
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.close();
          this.fab.focus();
        });
      }

      // Close on clicking outside
      document.addEventListener('click', (e) => {
        if (!this.isOpen) return;
        const target = e.target;
        if (!this.cloud.contains(target) && !this.fab.contains(target)) {
          this.close();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          this.fab.focus();
        }
      });

      // Quick prompt chips
      this.chips.forEach((chip) => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const msg = chip.getAttribute('data-msg') || chip.textContent.trim();
          this.sendMessage(msg);
        });
      });

      // Form submission
      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          e.preventDefault();
          const text = this.input ? this.input.value.trim() : '';
          this.sendMessage(text || this.defaultMessage);
        });
      }
    }

    updateTimestamp() {
      if (!this.timeEl) return;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.timeEl.textContent = `${hours}:${minutes}`;
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.updateTimestamp();

      this.cloud.removeAttribute('hidden');
      this.cloud.setAttribute('aria-hidden', 'false');
      this.cloud.classList.add('is-open');

      this.fab.setAttribute('aria-expanded', 'true');
      this.fab.classList.add('is-chat-active');

      if (this.badge && this.badge.style) {
        this.badge.style.display = 'none';
      }

      setTimeout(() => {
        if (this.input) this.input.focus();
      }, 150);
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;

      this.cloud.classList.remove('is-open');
      this.cloud.setAttribute('aria-hidden', 'true');
      this.fab.setAttribute('aria-expanded', 'false');
      this.fab.classList.remove('is-chat-active');

      setTimeout(() => {
        if (!this.isOpen) {
          this.cloud.setAttribute('hidden', '');
        }
      }, 250);
    }

    sendMessage(text) {
      const cleanText = text && text.trim().length > 0 ? text.trim() : this.defaultMessage;
      const targetUrl = `https://wa.me/${this.phone}?text=${encodeURIComponent(cleanText)}`;

      if (typeof window !== 'undefined') {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }

      if (this.input) this.input.value = '';
      this.close();
    }
  }

  const moduleExport = {
    WhatsAppChatController,
    initWhatsAppChat: (options) => new WhatsAppChatController(options)
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = moduleExport;
  }

  if (typeof window !== 'undefined') {
    window.duyvestiWhatsAppChat = moduleExport;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => moduleExport.initWhatsAppChat());
    } else {
      moduleExport.initWhatsAppChat();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
