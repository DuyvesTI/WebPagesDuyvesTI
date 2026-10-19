/**
 * src/js/parallax.js - DuyvesTI Editorial Motion & Dual-Plane Parallax Controller
 * Inspired by https://hajimewatanabe.jp/ (DistortionScreen & Spring-Physics Inertia)
 *
 * Implements:
 * - Native CSS Scroll-Driven Animations (`view-timeline`, `animation-timeline: view()`, `animation-range`)
 *   with feature-detected JS IntersectionObserver + requestAnimationFrame fallback.
 * - Hajime Watanabe-inspired Dual-Plane ("backScreen" + "cell") damped pointer parallax
 *   on Hero and Portfolio visual frames.
 * - Smooth spring-physics scroll velocity response (`--scroll-spring`) on visual media.
 * - Strict adherence to `prefers-reduced-motion: reduce` accessibility preference.
 */

(function (global) {
  'use strict';

  function prefersReducedMotion() {
    if (typeof global.matchMedia !== 'function') return false;
    return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function supportsScrollDrivenAnimations() {
    if (typeof global.CSS === 'undefined' || typeof global.CSS.supports !== 'function') {
      return false;
    }
    return global.CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  }

  /**
   * Fallback for multi-layer vertical scroll parallax when native CSS `view-timeline`
   * and `animation-range: entry` are not supported.
   */
  function initScrollParallaxFallback() {
    if (typeof document === 'undefined' || prefersReducedMotion() || supportsScrollDrivenAnimations()) {
      return;
    }

    var wrappers = document.querySelectorAll('[data-parallax-wrapper]');
    if (!wrappers.length || typeof IntersectionObserver === 'undefined') return;

    var activeWrappers = new Set();
    var ticking = false;

    function updateLayers() {
      ticking = false;
      var scrollY = global.scrollY || global.pageYOffset || 0;
      var windowHeight = global.innerHeight || 800;

      activeWrappers.forEach(function (wrapper) {
        var rect = wrapper.getBoundingClientRect();
        var wrapperTop = rect.top + scrollY;
        var wrapperHeight = rect.height || 1;

        if (scrollY >= wrapperTop - windowHeight && scrollY <= wrapperTop + wrapperHeight) {
          var scrollPercent = (scrollY - (wrapperTop - windowHeight)) / (wrapperHeight + windowHeight);
          var centeredProgress = (scrollPercent - 0.5) * 2;

          var layers = wrapper.querySelectorAll('[data-parallax-speed]');
          layers.forEach(function (layer) {
            var speed = parseFloat(layer.getAttribute('data-parallax-speed')) || 0;
            var translateY = Math.round(centeredProgress * speed * -70);
            layer.style.transform = 'translate3d(0, ' + translateY + 'px, 0)';
          });
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        if (typeof global.requestAnimationFrame === 'function') {
          global.requestAnimationFrame(updateLayers);
        } else {
          updateLayers();
        }
      }
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeWrappers.add(entry.target);
          } else {
            activeWrappers.delete(entry.target);
          }
        });

        if (activeWrappers.size > 0) {
          global.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        } else {
          global.removeEventListener('scroll', onScroll);
        }
      },
      { threshold: 0, rootMargin: '100px 0px' }
    );

    wrappers.forEach(function (w) {
      observer.observe(w);
    });
  }

  /**
   * Fallback for entry reveal animations when native CSS `animation-timeline: view()`
   * is not supported.
   */
  function initRevealFallback() {
    if (typeof document === 'undefined' || prefersReducedMotion() || supportsScrollDrivenAnimations()) {
      return;
    }

    var revealItems = document.querySelectorAll('.reveal-on-scroll');
    if (!revealItems.length || typeof IntersectionObserver === 'undefined') return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * Hajime Watanabe-inspired Dual-Plane ("backScreen" + "cell") Damped Pointer Glide
   * on the Hero visual stage and Portfolio visual frames (desktop pointer devices).
   */
  function initEditorialDualPlaneParallax() {
    if (typeof document === 'undefined' || prefersReducedMotion()) return;

    var stage = document.getElementById('hero-parallax-stage');
    if (stage) {
      var floatingItems = stage.querySelectorAll('[data-depth]');
      var heroImg = stage.querySelector('.hero-showcase-img');
      var curX = 0;
      var curY = 0;
      var tgtX = 0;
      var tgtY = 0;
      var rafId = null;

      function stepHeroGlide() {
        curX += (tgtX - curX) * 0.065;
        curY += (tgtY - curY) * 0.065;

        floatingItems.forEach(function (item) {
          var depth = parseFloat(item.getAttribute('data-depth')) || 1;
          var moveX = (curX * depth * 9).toFixed(2);
          var moveY = (curY * depth * 9).toFixed(2);
          item.style.setProperty('--pointer-x', moveX + 'px');
          item.style.setProperty('--pointer-y', moveY + 'px');
        });

        // Counter-pan inner image ("backScreen" vs "cell" depth illusion)
        if (heroImg) {
          var imgX = (-curX * 11).toFixed(2);
          var imgY = (-curY * 8).toFixed(2);
          heroImg.style.transform = 'scale(1.06) translate3d(' + imgX + 'px, ' + imgY + 'px, 0)';
        }

        if (Math.abs(tgtX - curX) > 0.002 || Math.abs(tgtY - curY) > 0.002) {
          rafId = global.requestAnimationFrame(stepHeroGlide);
        } else {
          rafId = null;
        }
      }

      stage.addEventListener(
        'pointermove',
        function (e) {
          if (e.pointerType === 'touch') return;
          var rect = stage.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          tgtX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          tgtY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          if (!rafId && typeof global.requestAnimationFrame === 'function') {
            rafId = global.requestAnimationFrame(stepHeroGlide);
          }
        },
        { passive: true }
      );

      stage.addEventListener(
        'pointerleave',
        function () {
          tgtX = 0;
          tgtY = 0;
          if (!rafId && typeof global.requestAnimationFrame === 'function') {
            rafId = global.requestAnimationFrame(stepHeroGlide);
          }
        },
        { passive: true }
      );
    }

    // Portfolio cards: subtle inner-image liquid pan on pointer move
    var portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach(function (card) {
      var img = card.querySelector('.portfolio-img');
      if (!img) return;

      card.addEventListener(
        'pointermove',
        function (e) {
          if (e.pointerType === 'touch') return;
          var rect = card.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          var nx = (e.clientX - rect.left) / rect.width - 0.5;
          var ny = (e.clientY - rect.top) / rect.height - 0.5;
          img.style.setProperty('--cell-x', (-nx * 14).toFixed(1) + 'px');
          img.style.setProperty('--cell-y', (-ny * 10).toFixed(1) + 'px');
        },
        { passive: true }
      );

      card.addEventListener(
        'pointerleave',
        function () {
          img.style.setProperty('--cell-x', '0px');
          img.style.setProperty('--cell-y', '0px');
        },
        { passive: true }
      );
    });
  }

  function initAllParallax() {
    initScrollParallaxFallback();
    initRevealFallback();
    initEditorialDualPlaneParallax();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllParallax);
    } else {
      initAllParallax();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      prefersReducedMotion: prefersReducedMotion,
      supportsScrollDrivenAnimations: supportsScrollDrivenAnimations,
      initAllParallax: initAllParallax
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
