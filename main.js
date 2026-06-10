/* ─────────────────────────────────────────────────────────
   CHRISTIAN PRIETO PORTFOLIO  ·  main.js
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

/* ── NAV SCROLL BEHAVIOR ──────────────────────────────────── */
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

/* ── HERO ENTRANCE ANIMATION ──────────────────────────────── */
function initHero() {
  const tl = gsap.timeline({ delay: 0.15 });

  tl.to('#heroEyebrow',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to('#heroLine1',    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .to('#heroLine2',    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
    .to('#heroHandle',   { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('#heroStrip',    { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .to('#heroCtas',     { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    .to('#heroTags',     { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to('#heroVisual',   { opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.6');
}

/* ── IPAD MOUSE PARALLAX ──────────────────────────────────── */
function initIpadParallax() {
  const ipad = document.getElementById('ipadMockup');
  if (!ipad) return;

  let targetX = -18, targetY = 4;
  let currentX = -18, currentY = 4;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const nx = (e.clientX - cx) / cx;
    const ny = (e.clientY - cy) / cy;
    targetX = -18 + nx * 12;
    targetY = 4 - ny * 6;
  }, { passive: true });

  (function loop() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    ipad.style.transform = `perspective(1200px) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
    requestAnimationFrame(loop);
  })();
}

/* ── PHOTO STACK GSAP ─────────────────────────────────────── */
function initPhotoStack() {
  const pin = document.getElementById('stackPin');
  if (!pin) return;

  gsap.registerPlugin(ScrollTrigger);

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

  // Fan cards out as you scroll
  tl.to('#sc1', { x: '-220px', rotation: -15, scale: 0.82, opacity: 0.85, duration: 1 }, 0)
    .to('#sc2', { x: '-110px', rotation: -7,  scale: 0.9,  opacity: 0.9,  duration: 1 }, 0)
    .to('#sc3', { x: 0,        rotation: 0,   scale: 1.02,                 duration: 1 }, 0)
    .to('#sc4', { x: '110px',  rotation: 7,   scale: 0.9,  opacity: 0.9,  duration: 1 }, 0)
    .to('#sc5', { x: '220px',  rotation: 15,  scale: 0.82, opacity: 0.85, duration: 1 }, 0)
    .to('#stackLabel', { opacity: 1, y: 0, duration: 0.5 }, 0.3);
}

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
function initScrollAnims() {
  // Generic fade-up
  gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      }
    });
  });

  // Slide from left
  gsap.utils.toArray('.gsap-slide-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    });
  });

  // Slide from right
  gsap.utils.toArray('.gsap-slide-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    });
  });

  // Stat cards stagger
  gsap.utils.toArray('.stats-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.gsap-counter-card');
    gsap.to(cards, {
      opacity: 1, y: 0, duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 78%',
        once: true,
        onEnter: () => initCounters(cards),
      }
    });
  });

  // Brand photo reveals
  document.querySelectorAll('.brand-photo-reveal').forEach(el => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
  });

  // Video cards stagger
  gsap.utils.toArray('.videos-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.video-card');
    gsap.to(cards, {
      opacity: 1, y: 0, duration: 0.6,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
    });
    cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(20px)'; });
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

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initNav();
  initHero();
  initIpadParallax();
  initPhotoStack();
  initScrollAnims();
  initProgressBars();
  fetchLiveStats();
});
