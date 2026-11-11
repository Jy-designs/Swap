/* Page behaviour: nav, scroll reveals, steps carousel, FAQ, asset chips. The calculator lives in swap.js. */
(function () {
  'use strict';

  // Where every "Download" button points. Replace with the app store / smart link.
  var DOWNLOAD_URL = '#';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  $$('[data-download]').forEach(function (a) { a.setAttribute('href', DOWNLOAD_URL); });

  /* ---------- Intro ---------- */
  requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  var nav = $('#nav');
  var burger = $('.nav__burger');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('.nav__menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false); });

  /* ---------- Scroll reveals ---------- */
  // Once an element has revealed, drop the attribute so hover transforms work again.
  function settle(el) {
    var delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    setTimeout(function () { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); }, 1100 + delay * 1000);
  }
  var revealEls = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.removeAttribute('data-reveal'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        settle(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Steps carousel ---------- */
  // Step 1 is the Figma copy. Steps 2 and 3 are drafts: replace them with the approved copy.
  var STEPS = [
    { title: 'Get Started', text: 'takes just a few minutes' },
    { title: 'Pick your pair', text: 'choose the crypto you sell and the one you buy' },
    { title: 'Review and swap', text: 'check the price and fees before you confirm' }
  ];
  var step = $('#step');
  var pager = $('#pager');
  if (step && pager) {
    var current = 0;
    var prev = $('.pager__arrow--prev', pager);
    var next = $('.pager__arrow--next', pager);
    var dots = $$('.pager__dot', pager);
    var active = $('.pager__active', pager);
    var fan = $('#fan');

    var paint = function () {
      prev.disabled = current === 0;
      next.disabled = current === STEPS.length - 1;
      active.style.setProperty('--i', current);
      dots.forEach(function (d, i) {
        if (i === current) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
    };
    var write = function () {
      $('#step-num').textContent = String(current + 1);
      $('#step-title').textContent = STEPS[current].title;
      $('#step-text').textContent = STEPS[current].text;
    };
    var go = function (i) {
      if (i < 0 || i >= STEPS.length || i === current) return;
      current = i;
      paint();
      if (reduce) { write(); return; }
      step.classList.remove('is-entering');
      step.classList.add('is-leaving');
      fan.classList.remove('is-nudging'); void fan.offsetWidth; fan.classList.add('is-nudging');
      setTimeout(function () {
        write();
        step.classList.remove('is-leaving');
        step.classList.add('is-entering');
      }, 180);
    };
    prev.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    pager.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    });
    // Swipe on the cards
    var x0 = null;
    fan.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    fan.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    });
    paint();
  }

  /* ---------- FAQ accordion ---------- */
  $$('.qa').forEach(function (qa) {
    var btn = $('.qa__q', qa);
    btn.addEventListener('click', function () {
      var open = !qa.classList.contains('is-open');
      $$('.qa.is-open').forEach(function (o) {
        if (o !== qa) { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); }
      });
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Asset chips: set "You receive" in the calculator and scroll up to it ---------- */
  $$('.chip[data-coin]').forEach(function (chip) {
    var t = chip.dataset.coin;
    chip.setAttribute('aria-label', 'Swap to ' + t + ' in the calculator');
    chip.addEventListener('click', function () {
      if (!window.vengaSwap || !window.vengaSwap.has(t)) return;
      window.vengaSwap.setReceive(t);
      var calc = $('#swap-calc');
      calc.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      var input = $('#from-amount');
      setTimeout(function () { input.focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
  });
})();
