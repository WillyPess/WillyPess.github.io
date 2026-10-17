'use strict';

// theme toggle: flips light/dark and remembers the choice; with no saved choice,
// keeps following the device setting (the inline <head> script sets the first one)
(function () {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const deviceDark = window.matchMedia('(prefers-color-scheme: dark)');

  const saved = () => {
    try {
      const theme = localStorage.getItem('theme');
      return theme === 'light' || theme === 'dark' ? theme : null;
    } catch (e) {
      return null;
    }
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

  deviceDark.addEventListener('change', (e) => {
    if (!saved()) apply(e.matches ? 'dark' : 'light');
  });

  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode: still switches, just not remembered */ }
  });
})();


// header: soft shadow once the page scrolls
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
})();


// mobile menu: hamburger opens the nav panel; link, outside tap, Escape or going wide closes it
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (!header || !toggle) return;

  const isOpen = () => header.classList.contains('nav-open');
  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  header.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
})();


// scroll-reveal: fades in [data-reveal] elements as they enter the viewport
(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // animations.js owns reveal motion when GSAP loaded; this stays as the fallback
  if (window.gsap && window.ScrollTrigger) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = Math.min(i * 45, 700) + 'ms';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  // wait a frame so the browser paints the initial opacity:0 state first,
  // otherwise above-the-fold elements flip to visible before there's anything
  // to transition from and just appear instantly
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach((el) => observer.observe(el));
    });
  });
})();


// portfolio filter
(function () {
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const filterItems = document.querySelectorAll('[data-filter-item]');
  if (!filterBtns.length || !filterItems.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const value = this.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      filterItems.forEach((item) => {
        const match = value === 'all' || value === item.dataset.category;
        item.classList.toggle('active', match);
      });
    });
  });
})();


// contact form validation
(function () {
  const form = document.querySelector('[data-form]');
  const formInputs = document.querySelectorAll('[data-form-input]');
  const formBtn = document.querySelector('[data-form-btn]');
  if (!form || !formInputs.length || !formBtn) return;

  formInputs.forEach((input) => {
    input.addEventListener('input', function () {
      formBtn.disabled = !form.checkValidity();
    });
  });
})();
