/* Victorious Beginnings: vanilla JS (no libraries) */
(function () {
  'use strict';

  /* ---------- SETTINGS: edit these ---------- */
  // Paste your real booking page link (Calendly, SimplePractice, etc.).
  // Every "Book..." button will use it. Leave empty to scroll to the Contact Us section.
  var BOOKING_URL = 'https://www.therapyportal.com/p/victorious/';
  // Optional: separate links for the two buttons in Our Services (fall back to BOOKING_URL if empty)
  var BOOKING_URL_CASH = '';
  var BOOKING_URL_INSURANCE = 'https://secure.helloalma.com/providers/nichole-henderson/';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Booking links ---------- */
  if (BOOKING_URL) {
    $$('.js-booking').forEach(function (a) {
      a.setAttribute('href', BOOKING_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }
  [['.js-booking-cash', BOOKING_URL_CASH], ['.js-booking-insurance', BOOKING_URL_INSURANCE]].forEach(function (p) {
    if (!p[1]) { return; }
    $$(p[0]).forEach(function (a) {
      a.setAttribute('href', p[1]);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  });
  // Placeholder "#" links should not jump to the top of the page
  $$('a[data-placeholder-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('href') === '#') { e.preventDefault(); }
    });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = $('#menu-toggle');
  var menu = $('#mobile-menu');

  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.menu-label', toggle).textContent = open ? 'Close' : 'Menu';
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('#site-header')) { setMenu(false); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) { setMenu(false); }
  });

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  var header = $('#site-header');
  var lastY = window.scrollY, ticking = false;
  function updateHeader() {
    var y = Math.max(window.scrollY, 0);
    var menuOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (menuOpen || y < 80 || y < lastY - 4 || header.contains(document.activeElement)) {
      header.classList.remove('header-hidden');   // near top, scrolling up, menu open, or keyboard focus inside
    } else if (y > lastY + 6) {
      header.classList.add('header-hidden');      // scrolling down
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateHeader); }
  }, { passive: true });
  header.addEventListener('focusin', function () { header.classList.remove('header-hidden'); });

  /* ---------- Back-to-top arrow: hidden until ~40% of the page is scrolled ---------- */
  var toTop = $('#to-top');
  function updateToTop() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var show = max > 0 && window.scrollY / max >= 0.4;
    toTop.classList.toggle('is-visible', show);
    toTop.tabIndex = show ? 0 : -1;
  }
  window.addEventListener('scroll', updateToTop, { passive: true });
  window.addEventListener('resize', updateToTop);
  updateToTop();

  /* ---------- Highlight the current section in the menu ---------- */
  var spyIds = ['home', 'welcome', 'reviews', 'about', 'services', 'rates', 'book', 'contact'];
  var spyLinks = $$('#site-header nav a[href^="#"]').filter(function (a) {
    return !a.classList.contains('btn') && a.getAttribute('href').length > 1;
  });

  function updateActive() {
    var current = spyIds[0];
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      current = 'contact';
    } else {
      spyIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) { current = id; }
      });
    }
    if (current === 'welcome' || current === 'reviews') { current = 'home'; } // intro + reviews belong to Home
    spyLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Fade-in on scroll ---------- */
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Services accordion: one open at a time ---------- */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentNode.parentNode;
      var willOpen = !item.classList.contains('is-open');
      $$('.acc').forEach(function (a) {
        a.classList.remove('is-open');
        $('.acc-btn', a).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Endorsements carousel (scroll-snap + prev/next, no autoplay) ---------- */
  var track = $('#endorse-track');
  var prevBtn = $('#endorse-prev');
  var nextBtn = $('#endorse-next');
  if (track && prevBtn && nextBtn) {
    var step = function () {
      var card = $('.endorse-card', track);
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };
    var updateArrows = function () {
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    prevBtn.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    nextBtn.addEventListener('click', function () { track.scrollBy({ left: step() }); });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* ---------- Donate modal (Zelle QR) ---------- */
  var donateModal = $('#donate-modal');
  var donateOpen = $('#donate-open');
  if (donateModal && donateOpen) {
    var closeDonate = function () {
      if (donateModal.open) { donateModal.close(); }
    };
    donateOpen.addEventListener('click', function () {
      if (typeof donateModal.showModal === 'function') { donateModal.showModal(); }
      else { donateModal.setAttribute('open', ''); }
    });
    $('#donate-close').addEventListener('click', closeDonate);
    // Click on the dimmed backdrop (outside the box) closes it
    donateModal.addEventListener('click', function (e) {
      if (e.target === donateModal) { closeDonate(); }
    });
    donateModal.addEventListener('close', function () { donateOpen.focus(); });
  }

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) { yr.textContent = new Date().getFullYear(); }
})();
