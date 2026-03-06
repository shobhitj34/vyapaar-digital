/**
 * Vyapaar Digital — main.js
 * Handles: nav scroll, mobile menu, stat counters, scroll reveals,
 *          portfolio filter, testimonial slider, form validation, back-to-top
 */

'use strict';

/* ── Navbar ──────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

function updateNavbar() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Active nav link based on scroll section
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ── Stat Counter ─────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = target / (duration / 16);
  let current    = 0;

  const tick = () => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      return;
    }
    el.textContent = Math.floor(current);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countersObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      countersObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero__stats');
if (heroStats) countersObserver.observe(heroStats);

/* ── Scroll Reveal ────────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .process__step, .portfolio-card, .why-card, .testimonial-card, .section-header, .contact__left, .contact__right, .why-us__left, .why-us__right'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger within parent
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const idx = Array.from(siblings).indexOf(el);
  if (idx > 0) el.classList.add(`reveal-delay-${Math.min(idx, 4)}`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Portfolio Filter ─────────────────────────────────────── */
const filterBtns   = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    portfolioCards.forEach(card => {
      const category = card.dataset.category;
      const show     = filter === 'all' || category === filter;
      card.style.display = show ? '' : 'none';
      // Re-trigger reveal
      if (show) setTimeout(() => card.classList.add('revealed'), 10);
    });
  });
});

/* ── Testimonials ─────────────────────────────────────────── */
const dots = document.querySelectorAll('.dot');
let testimonialInterval = null;

function goToTestimonial(index) {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-pressed', String(i === index));
  });
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToTestimonial(parseInt(dot.dataset.index, 10));
  });
});

// On mobile, auto-cycle testimonials
function startTestimonialCycle() {
  if (window.innerWidth < 1024) {
    const cards = document.querySelectorAll('.testimonial-card');
    let current = 0;
    cards.forEach((c, i) => { c.style.display = i === 0 ? '' : 'none'; });
    testimonialInterval = setInterval(() => {
      cards[current].style.display = 'none';
      current = (current + 1) % cards.length;
      cards[current].style.display = '';
      goToTestimonial(current);
    }, 4000);
  }
}

// Only cycle on mobile
if (window.innerWidth < 1024) startTestimonialCycle();

/* ── Contact Form ─────────────────────────────────────────── */
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const submitLbl = document.getElementById('submit-label');
const submitSpn = document.getElementById('submit-spinner');
const formSuc   = document.getElementById('form-success');

function validateField(field) {
  const errorEl = document.getElementById(`${field.id}-error`);
  let msg = '';

  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';

  const val = field.value.trim();

  if (field.hasAttribute('required') && !val) {
    msg = 'This field is required.';
  } else if (field.id === 'phone' && val) {
    // Exactly 10 digits, no spaces/dashes
    if (!/^\d{10}$/.test(val)) msg = 'Please enter a valid 10-digit contact number.';
  }

  if (msg) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = msg;
    return false;
  }
  return true;
}

// Only allow digits in the phone field
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    if (phoneInput.classList.contains('error')) validateField(phoneInput);
  });
}

form.querySelectorAll('input:not([type="file"]), textarea, select').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

/* ── File Upload ──────────────────────────────────────────── */
const fileInput   = document.getElementById('photos');
const filePreview = document.getElementById('file-preview');
const uploadZone  = document.getElementById('file-upload-zone');
const MAX_FILES   = 5;
const MAX_MB      = 5;
let selectedFiles = [];

function renderPreviews() {
  filePreview.innerHTML = '';
  selectedFiles.forEach((file, i) => {
    const li  = document.createElement('li');
    li.className = 'file-preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    img.onload = () => URL.revokeObjectURL(img.src);

    const name = document.createElement('span');
    name.textContent = file.name;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Remove ${file.name}`);
    del.addEventListener('click', () => {
      selectedFiles.splice(i, 1);
      renderPreviews();
    });

    li.append(img, name, del);
    filePreview.appendChild(li);
  });
}

function handleFiles(newFiles) {
  const photosErr = document.getElementById('photos-error');
  photosErr.textContent = '';
  const allowed = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
  const tooBig  = allowed.filter(f => f.size > MAX_MB * 1024 * 1024);

  if (tooBig.length) {
    photosErr.textContent = `Some files exceed ${MAX_MB}MB and were skipped.`;
  }
  const valid = allowed.filter(f => f.size <= MAX_MB * 1024 * 1024);
  selectedFiles = [...selectedFiles, ...valid].slice(0, MAX_FILES);

  if (selectedFiles.length >= MAX_FILES) {
    photosErr.textContent = `Maximum ${MAX_FILES} images allowed.`;
  }
  renderPreviews();
}

if (fileInput) {
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));
}

// Drag & drop
if (uploadZone) {
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fields = form.querySelectorAll('input[required]:not([type="file"]), textarea[required], select[required]');
  let isValid  = true;
  fields.forEach(f => { if (!validateField(f)) isValid = false; });
  if (!isValid) {
    form.querySelector('.error')?.focus();
    return;
  }

  // Loading state
  submitBtn.disabled    = true;
  submitLbl.textContent = 'Sending…';
  submitSpn.classList.remove('hidden');

  // Simulate submission (replace with real API endpoint)
  await new Promise(r => setTimeout(r, 1800));

  submitBtn.classList.add('hidden');
  formSuc.classList.remove('hidden');
  form.reset();
  selectedFiles = [];
  renderPreviews();
});

/* ── Back to top ──────────────────────────────────────────── */
const btt = document.getElementById('back-to-top');
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function updateBtt() {
  btt.classList.toggle('visible', window.scrollY > 500);
}

/* ── Footer year ──────────────────────────────────────────── */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Scroll handler (throttled) ───────────────────────────── */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateNavbar();
      updateActiveLink();
      updateBtt();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
updateNavbar(); // initial call

/* ── Smooth internal links ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
