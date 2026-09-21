'use strict';

// scroll-reveal: fades in [data-reveal] elements as they enter the viewport
(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
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
