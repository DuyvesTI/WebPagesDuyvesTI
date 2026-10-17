/**
 * src/js/nav.js - Navigation & Accessible Mobile Drawer Controller
 *
 * Implements Features F04 & F05:
 * - Sticky Header Elevation & ScrollSpy
 * - Mobile Drawer with 48x48px minimum tap targets
 * - Strict Bi-directional Keyboard Focus Trap (Tab & Shift+Tab)
 * - Escape Key Dismissal & Backdrop Click Closure
 * - Background Isolation via HTML5 'inert' attribute
 * - Smooth Auto-close on link navigation
 * - Responsive Viewport Breakpoint Reset
 */

(function (global) {
  'use strict';

  // Interactive selectors within drawer for Focus Trap
  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  let isDrawerOpen = false;
  let previouslyFocusedElement = null;

  /**
   * Helper to query cached or live DOM elements
   */
  function getElements() {
    return {
      siteHeader: document.getElementById('site-header') || document.querySelector('header'),
      toggleBtn: document.getElementById('mobile-menu-toggle') || document.querySelector('button.mobile-menu-btn, button[aria-controls="mobile-menu"]'),
      drawer: document.getElementById('mobile-menu') || document.querySelector('.mobile-drawer'),
      backdrop: document.getElementById('mobile-drawer-backdrop') || document.querySelector('.drawer-backdrop'),
      closeBtn: document.getElementById('mobile-drawer-close') || document.querySelector('.drawer-close-btn'),
      mainContent: document.getElementById('main-content') || document.querySelector('main'),
      siteFooter: document.getElementById('site-footer') || document.querySelector('footer')
    };
  }

  /**
   * Opens the mobile drawer modal
   */
  function openDrawer() {
    const { toggleBtn, drawer, backdrop, closeBtn, mainContent, siteFooter } = getElements();
    if (isDrawerOpen || !drawer || !backdrop || !toggleBtn) return;

    previouslyFocusedElement = document.activeElement;
    isDrawerOpen = true;

    // 1. Update ARIA and UI states
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
    toggleBtn.classList.add('is-active');

    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');

    // 2. Lock body scroll
    document.body.classList.add('drawer-open');

    // 3. Background isolation via modern HTML5 inert
    if (mainContent && 'inert' in mainContent) {
      mainContent.inert = true;
    }
    if (siteFooter && 'inert' in siteFooter) {
      siteFooter.inert = true;
    }

    // 4. Set focus inside drawer
    requestAnimationFrame(() => {
      if (closeBtn) {
        closeBtn.focus();
      } else {
        const firstFocusable = drawer.querySelector(FOCUSABLE_SELECTOR);
        if (firstFocusable) firstFocusable.focus();
      }
    });

    // 5. Attach keyboard trap listener
    document.addEventListener('keydown', handleDrawerKeydown);
  }

  /**
   * Closes the mobile drawer modal
   */
  function closeDrawer() {
    const { toggleBtn, drawer, backdrop, mainContent, siteFooter } = getElements();
    if (!isDrawerOpen || !drawer || !backdrop || !toggleBtn) return;

    isDrawerOpen = false;

    // 1. Update ARIA and UI states
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Abrir menú de navegación');
    toggleBtn.classList.remove('is-active');

    drawer.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');

    // 2. Unlock body scroll
    document.body.classList.remove('drawer-open');

    // 3. Remove background isolation
    if (mainContent && 'inert' in mainContent) {
      mainContent.inert = false;
    }
    if (siteFooter && 'inert' in siteFooter) {
      siteFooter.inert = false;
    }

    // 4. Remove keyboard trap listener
    document.removeEventListener('keydown', handleDrawerKeydown);

    // 5. Restore focus
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
      previouslyFocusedElement.focus();
    } else if (toggleBtn) {
      toggleBtn.focus();
    }
  }

  /**
   * Focus Trap & Escape Key Listener
   * @param {KeyboardEvent} e
   */
  function handleDrawerKeydown(e) {
    if (!isDrawerOpen) return;

    // Escape Key Dismissal
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Tab Navigation Trapping
    if (e.key === 'Tab') {
      const { drawer } = getElements();
      if (!drawer) return;

      const focusableElements = Array.from(drawer.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null // Visible elements only
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backward wrap)
      if (e.shiftKey) {
        if (document.activeElement === firstElement || !drawer.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forward wrap)
      else {
        if (document.activeElement === lastElement || !drawer.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  /**
   * Sticky Header Elevation on Scroll
   */
  function initHeaderScroll() {
    const { siteHeader } = getElements();
    if (!siteHeader || typeof window === 'undefined') return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /**
   * ScrollSpy: Active Section Indicator
   */
  function initScrollSpy() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link, .drawer-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}` || (href === '/' && id === 'inicio')) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            } else {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach((section) => observer.observe(section));
  }

  /**
   * Auto-Close Drawer on Navigation Link Click
   */
  function initDrawerLinks() {
    const { drawer } = getElements();
    if (!drawer) return;

    const links = drawer.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });
  }

  /**
   * Viewport Breakpoint Reset Guard
   */
  function initResizeListener() {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const desktopQuery = window.matchMedia('(min-width: 900px)');
    desktopQuery.addEventListener('change', (e) => {
      if (e.matches && isDrawerOpen) {
        closeDrawer();
      }
    });
  }

  /**
   * Initialize All Navigation Controls
   */
  function initNav() {
    const { toggleBtn, closeBtn, backdrop } = getElements();

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isDrawerOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
      });
    }

    initDrawerLinks();
    initHeaderScroll();
    initScrollSpy();
    initResizeListener();
  }

  const navController = {
    openDrawer,
    closeDrawer,
    isDrawerOpen: () => isDrawerOpen,
    initNav
  };

  // Export for testing and module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = navController;
  }
  if (typeof window !== 'undefined') {
    window.duyvestiNav = navController;
  }

  // Auto-init on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNav);
    } else {
      initNav();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
