/* Victorious Beginnings: vanilla JS (no libraries) */
(function () {
  'use strict';

  /* ---------- SETTINGS: edit these ---------- */
  // Paste your real booking page link (Calendly, SimplePractice, etc.).
  // Every "Book..." button will use it. Leave empty to scroll to the contact form.
  var BOOKING_URL = '';

  // Optional: a form service address (e.g., Formspree) to receive messages.
  // Leave empty and the form only shows the thank-you message (nothing is sent).
  var FORM_ENDPOINT = '';

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
    toggle.textContent = open ? 'Close' : 'Menu';
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
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) { setMenu(false); }
  });

  /* ---------- Highlight the current section in the menu ---------- */
  var spyIds = ['home', 'about', 'services', 'testimonials', 'book-rec', 'book', 'contact'];
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
        if (el && el.getBoundingClientRect().top <= 120) { current = id; }
      });
    }
    spyLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Contact form validation ---------- */
  var form = $('#contact-form');
  var success = $('#form-success');

  function setError(field, msg) {
    $('#' + field.id + '-error').textContent = msg;
    if (msg) { field.setAttribute('aria-invalid', 'true'); } else { field.removeAttribute('aria-invalid'); }
  }

  function validateField(field) {
    var v = field.value.trim();
    var msg = '';
    if (field.id === 'name') {
      if (!v) { msg = 'Please enter your name.'; }
    } else if (field.id === 'email') {
      if (!v) { msg = 'Please enter your email address.'; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg = 'Please enter a valid email address.'; }
    } else if (field.id === 'phone') {
      if (v && !/^[+()\-.\s\d]{7,20}$/.test(v)) { msg = 'Please enter a valid phone number.'; }
    } else if (field.id === 'message') {
      if (!v) { msg = 'Please write a short message.'; }
      else if (v.length < 10) { msg = 'Please add a few more details.'; }
    }
    setError(field, msg);
    return !msg;
  }

  var fields = ['name', 'email', 'phone', 'message'].map(function (id) { return document.getElementById(id); });
  fields.forEach(function (f) {
    f.addEventListener('blur', function () { validateField(f); });
    f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') { validateField(f); } });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    success.classList.add('hidden');

    var firstInvalid = null;
    fields.forEach(function (f) {
      if (!validateField(f) && !firstInvalid) { firstInvalid = f; }
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    function done() {
      form.reset();
      success.classList.remove('hidden');
      success.focus();
    }
    function fail() {
      alert('Sorry, something went wrong. Please call or email us directly.');
    }

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (res) { if (res.ok) { done(); } else { fail(); } })
        .catch(fail);
    } else {
      done(); // No form service connected yet
    }
  });

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) { yr.textContent = new Date().getFullYear(); }
})();
