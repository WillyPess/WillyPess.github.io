'use strict';

// GSAP motion layer. Runs only when GSAP + ScrollTrigger loaded and the visitor
// hasn't asked for reduced motion; otherwise the CSS reveal in script.js takes over.
(function () {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  document.documentElement.classList.add('gsap-on');


  // hero intro: portrait, name, headline word by word, then copy and buttons
  let introEnd = 0;
  const hero = document.querySelector('.intro-hero');
  if (hero) {
    const headline = hero.querySelector('.hero-headline');
    if (headline) splitWords(headline);

    const intro = gsap.timeline({ delay: 0.15, defaults: { clearProps: 'opacity,transform' } })
      .from('.hero-portrait', { opacity: 0, scale: 0.6, duration: 0.7, ease: 'back.out(1.7)' })
      .from(['.hero-name', '.hero-role'], { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, '-=0.35')
      .from('.hero-headline .word', { opacity: 0, y: 24, duration: 0.6, stagger: 0.04 }, '-=0.25')
      .from('.hero-text', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
      .from('.hero-actions .btn', { opacity: 0, y: 12, duration: 0.5, stagger: 0.08 }, '-=0.35');
    introEnd = performance.now() + (intro.delay() + intro.duration()) * 1000;
  }


  // anything already on screen at load waits for the hero intro to (nearly) finish
  const afterIntro = () => Math.max(0, (introEnd - performance.now()) / 1000 - 0.4);


  // scroll reveal: everything outside the hero rises in, staggered in waves
  const revealItems = gsap.utils.toArray('[data-reveal]').filter((el) => !el.closest('.intro-hero'));
  if (revealItems.length) {
    gsap.set(revealItems, { opacity: 0, y: 28 });
    ScrollTrigger.batch(revealItems, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: afterIntro(), overwrite: true, clearProps: 'transform',
      }),
    });
  }


  // metrics count up from 0 the first time they're seen
  document.querySelectorAll('.metric-value').forEach((el) => {
    const match = el.textContent.trim().match(/^(\D*)([\d,]+)(.*)$/);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits.replace(/,/g, ''), 10);
    const useCommas = digits.includes(',');
    const counter = { value: 0 };
    const render = () => {
      const n = Math.round(counter.value);
      el.textContent = prefix + (useCommas ? n.toLocaleString('en-US') : n) + suffix;
    };

    render();
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(counter, { value: target, duration: 1.6, delay: afterIntro(), ease: 'power2.out', onUpdate: render }),
    });
  });


  // experience timeline: accent line draws down as you scroll (see .gsap-on .timeline::before)
  document.querySelectorAll('.timeline').forEach((line) => {
    gsap.fromTo(line, { '--line': 0 }, {
      '--line': 1,
      ease: 'none',
      scrollTrigger: { trigger: line, start: 'top 75%', end: 'bottom 85%', scrub: 0.5 },
    });
  });


  // portfolio filter: re-animate the cards left after script.js toggles .active
  document.querySelectorAll('[data-filter-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const shown = document.querySelectorAll('[data-filter-item].active');
      gsap.fromTo(shown, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.06, overwrite: true, clearProps: 'transform',
      });
      ScrollTrigger.refresh();
    });
  });


  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      el.append(span);
      if (i < words.length - 1) el.append(' ');
    });
  }
})();
