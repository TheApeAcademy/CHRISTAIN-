/* ─────────────────────────────────────────────────────────
   CHRISTAIN- · Issue 001  ·  main.js
   ───────────────────────────────────────────────────────── */

/* ── SUPABASE CONFIG ──────────────────────────────────────── */
const SUPABASE_URL = 'https://gtnnzhphexfjblujspmr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bm56aHBoZXhmamJsdWpzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzU2NzUsImV4cCI6MjA4Nzg1MTY3NX0.a7zi2U0VeTFpLNQu1Csh-VwjqwaVlKwnbj7T1C27kak';

/* ── UTILITY ──────────────────────────────────────────────── */
function formatNum(value, suffix) {
  if (suffix === 'M') return value.toFixed(1) + 'M';
  if (suffix === 'K') {
    if (value >= 100) return Math.round(value) + 'K';
    return value.toFixed(1) + 'K';
  }
  if (suffix === '%') return value.toFixed(1) + '%';
  return Math.round(value).toString();
}

function countUp(el, target, suffix, duration = 1800) {
  const start = performance.now();
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  (function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const val = easeOutCubic(progress) * target;
    el.textContent = formatNum(val, suffix);
    if (progress < 1) requestAnimationFrame(frame);
  })(start);
}

/* ── SUPABASE STATS FETCH ─────────────────────────────────── */
async function fetchLiveStats() {
  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await client.from('portfolio_stats').select('*');
    if (error || !data || !data.length) return;

    data.forEach(row => {
      const el = document.querySelector(
        `.stat-number[data-platform="${row.platform}"][data-metric="${row.metric}"]`
      );
      if (!el) return;
      el.setAttribute('data-target', row.value);
      el.setAttribute('data-suffix', row.suffix || '');
      el.textContent = formatNum(row.value, row.suffix || '');
    });

    const syncEl = document.getElementById('lastSync');
    if (syncEl) {
      const d = new Date();
      syncEl.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (_) { /* silent — fallback to hardcoded values */ }
}

/* ── NAV ──────────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('navOverlay');
  const navClose = document.getElementById('navClose');
  const overlayLinks = document.querySelectorAll('.overlay-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  function openNav() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openNav);
  navClose.addEventListener('click', closeNav);
  overlayLinks.forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

/* ── MASTHEAD ENTRANCE ────────────────────────────────────── */
function initMasthead() {
  const barcode = document.getElementById('mastheadBarcode');
  if (barcode) {
    for (let i = 0; i < 48; i++) {
      const span = document.createElement('span');
      const w = Math.random() > 0.6 ? 4 : (Math.random() > 0.5 ? 2 : 1);
      const h = 12 + Math.random() * 16;
      span.style.cssText = `width:${w}px;height:${h}px`;
      barcode.appendChild(span);
    }
  }

  const tl = gsap.timeline({ delay: 0.1 });
  tl.to('#mastheadIssue', { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .to('#mastheadBarcode', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.4')
    .to('#mLine1', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
    .to('#mLine2', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.5')
    .to('#mLine3', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.55')
    .to('#mLine4', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.45')
    .to('#mastheadMeta', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .to('#heroCtas',     { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to('#heroTags',     { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.15');
}

/* ── PHOTO STACK ──────────────────────────────────────────── */
function initPhotoStack() {
  const pin = document.getElementById('stackPin');
  if (!pin) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#photo-stack',
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
    }
  });

  tl.to('#sc1', { x: '-260px', rotation: -14, scale: 0.84, opacity: 0.85, duration: 1 }, 0)
    .to('#sc2', { x: '-130px', rotation: -6,  scale: 0.92, opacity: 0.9,  duration: 1 }, 0)
    .to('#sc3', { x: 0,        rotation: 1,   scale: 1.02,                 duration: 1 }, 0)
    .to('#sc4', { x: '130px',  rotation: 7,   scale: 0.91, opacity: 0.9,  duration: 1 }, 0)
    .to('#sc5', { x: '260px',  rotation: 13,  scale: 0.84, opacity: 0.85, duration: 1 }, 0)
    .to('#stackLabel', { opacity: 1, y: 0, duration: 0.5 }, 0.3);
}

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
function initScrollAnims() {
  gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 84%', once: true }
    });
  });

  gsap.utils.toArray('.gsap-slide-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  gsap.utils.toArray('.gsap-slide-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  gsap.utils.toArray('.stats-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.gsap-counter-card');
    gsap.to(cards, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: {
        trigger: grid, start: 'top 78%', once: true,
        onEnter: () => initCounters(cards),
      }
    });
  });

  document.querySelectorAll('.brand-photo-reveal').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
  });

  gsap.utils.toArray('.videos-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.video-card');
    cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(20px)'; });
    gsap.to(cards, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
    });
  });

  // Annotation wriggle-in
  gsap.utils.toArray('.annotation').forEach(el => {
    gsap.fromTo(el,
      { x: 20, opacity: 0 },
      { x: 0, opacity: 0.85, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      }
    );
  });
}

/* ── COUNTER ANIMATIONS ───────────────────────────────────── */
function initCounters(cards) {
  (cards || document.querySelectorAll('.stat-number')).forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (!isNaN(target)) countUp(el, target, suffix);
  });
}

/* ── PROGRESS BARS ────────────────────────────────────────── */
function initProgressBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const width = parseFloat(bar.getAttribute('data-width'));
    if (isNaN(width)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => { bar.style.width = width + '%'; }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(bar);
  });
}

/* ── TRADING CARD 3D TILT ─────────────────────────────────── */
function initTradingCards() {
  document.querySelectorAll('.trade-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      gsap.to(card, { rotateY: dx * 12, rotateX: -dy * 8, duration: 0.15, ease: 'none', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', transformPerspective: 800 });
    });
  });
}

/* ── GRAIN TOGGLE FOR LIGHT CHAPTERS ─────────────────────── */
function initGrainChapters() {
  const lightSelectors = '[data-chapter="ch01"],[data-chapter="ch02"],[data-chapter="ch05"]';
  document.querySelectorAll(lightSelectors).forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter:      () => document.body.classList.add('light-chapter'),
      onLeave:      () => document.body.classList.remove('light-chapter'),
      onEnterBack:  () => document.body.classList.add('light-chapter'),
      onLeaveBack:  () => document.body.classList.remove('light-chapter'),
    });
  });
}

/* ── PAGE FLIPS ───────────────────────────────────────────── */
function initPageFlips() {
  gsap.to('#hero', {
    rotateY: -180,
    transformOrigin: 'left center',
    transformPerspective: 1400,
    ease: 'none',
    scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top 30%', scrub: 1 }
  });

  gsap.to('#stats', {
    rotateY: -180,
    transformOrigin: 'left center',
    transformPerspective: 1400,
    ease: 'none',
    scrollTrigger: { trigger: '#brands', start: 'top bottom', end: 'top 30%', scrub: 1 }
  });
}

/* ── SOCIAL PROOF ENTRANCE ────────────────────────────────── */
function initSocialProof() {
  const section = document.getElementById('social-proof');
  if (!section) return;

  const phone = document.getElementById('socialPhone');
  const text  = section.querySelector('.social-editorial-text');

  if (phone) {
    gsap.to(phone, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true }
    });
  }
  if (text) {
    gsap.to(text, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      delay: 0.2,
    });
  }
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initNav();
  initMasthead();
  initPhotoStack();
  initScrollAnims();
  initProgressBars();
  initTradingCards();
  initGrainChapters();
  initPageFlips();
  initSocialProof();
  fetchLiveStats();
});
