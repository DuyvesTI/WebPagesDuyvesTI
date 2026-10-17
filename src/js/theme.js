/**
 * src/js/theme.js - DuyvesTI Theme Engine & Controller
 * Manages Dark/Light mode, dual localStorage sync, system preference changes, and ARIA updates.
 * Complies with Feature F03 & WCAG AA contrast rules.
 */

(function (global) {
  'use strict';

  const PRIMARY_STORAGE_KEY = 'duyvesti-theme';
  const ALIAS_STORAGE_KEY = 'duyvesti_theme';

  const ICONS = {
    sun: `<svg xmlns="http://www.w3.org/2000/svg" class="theme-icon icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" class="theme-icon icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`
  };

  /**
   * Get the currently active theme from documentElement
   * @returns {'dark' | 'light'}
   */
  function getActiveTheme() {
    if (typeof document === 'undefined') return 'dark';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light') return 'light';
    if (attr === 'dark') return 'dark';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  /**
   * Update UI and ARIA attributes on all theme toggle buttons
   * @param {'dark' | 'light'} theme
   */
  function updateToggleButtons(theme) {
    if (typeof document === 'undefined') return;
    const buttons = document.querySelectorAll('[data-theme-toggle], #theme-toggle, .theme-toggle, button[aria-label*="tema"]');
    const isDark = theme === 'dark';
    const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

    buttons.forEach((btn) => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    });
  }

  /**
   * Apply theme to document, updating attributes, meta tags, and buttons
   * @param {'dark' | 'light'} theme
   * @param {boolean} [persist=true]
   */
  function applyTheme(theme, persist = true) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Enable temporary smooth transition
    root.classList.add('theme-transitioning');

    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = theme;

    // Persist choice to both primary and alias keys
    if (persist) {
      try {
        localStorage.setItem(PRIMARY_STORAGE_KEY, theme);
        localStorage.setItem(ALIAS_STORAGE_KEY, theme);
      } catch (e) {
        // Handle sandboxed storage error gracefully
      }
    }

    // Update mobile address bar meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const colorHex = theme === 'dark' ? '#0A0D14' : '#F8FAFC';
    if (metaTheme) {
      metaTheme.setAttribute('content', colorHex);
    }

    // Update buttons in DOM
    updateToggleButtons(theme);

    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 220);

    // Dispatch event for child components & listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('duyvesti:theme-change', { detail: { theme } }));
    }
  }

  /**
   * Toggle between dark and light themes
   */
  function toggleTheme() {
    const current = getActiveTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    return next;
  }

  /**
   * Initialize theme listeners
   */
  function initTheme() {
    if (typeof document === 'undefined') return;

    let initialTheme = 'light';
    try {
      const stored = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(ALIAS_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        initialTheme = stored;
      }
    } catch (e) {
      initialTheme = 'light';
    }

    applyTheme(initialTheme, false);

    // Attach click listener to toggle buttons
    const buttons = document.querySelectorAll('[data-theme-toggle], #theme-toggle, .theme-toggle, button[aria-label*="tema"]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    // Listen for OS color scheme change (only applies if user hasn't explicitly set preference)
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          let stored = null;
          try {
            stored = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(ALIAS_STORAGE_KEY);
          } catch (err) {}

          if (!stored) {
            applyTheme(e.matches ? 'dark' : 'light', false);
          }
        });
      } catch (err) {
        // Fallback for older browsers
      }
    }
  }

  const themeEngine = {
    getActiveTheme,
    applyTheme,
    toggleTheme,
    initTheme,
    STORAGE_KEY: PRIMARY_STORAGE_KEY
  };

  // Export for CommonJS, Browser Global, and ES Module compatibility
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeEngine;
  }
  if (typeof window !== 'undefined') {
    window.duyvestiTheme = themeEngine;
  }

  // Auto-initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
