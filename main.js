/* ─────────────────────────────────────────────────────────
   CHRISTAIN- · Issue 001  ·  main.js
   MagazineFlip — 10-page book with GSAP transitions
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

/* ── MAGAZINE FLIP CLASS ──────────────────────────────────── */
class MagazineFlip {
  constructor() {
    this.pages = Array.from(document.querySelectorAll('.mag-page'));
    this.total = this.pages.length;
    this.current = 0;
    this.animating = false;

    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.dots = Array.from(document.querySelectorAll('.dot-nav__dot'));
    this.counter = document.getElementById('pageCounter');

    this._init();
  }

  _init() {
    // Set up initial state — show first page
    this.pages.forEach((p, i) => {
      p.classList.remove('is-active', 'is-prev');
      if (i === 0) p.classList.add('is-active');
    });

    this._updateUI();
    this._bindEvents();
    this.onPageEnter(0);
  }

  _bindEvents() {
    // Prev / next buttons
    this.btnPrev.addEventListener('click', () => this.go(this.current - 1));
    this.btnNext.addEventListener('click', () => this.go(this.current + 1));

    // Dot nav
    this.dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-goto'), 10);
        this.go(target);
      });
    });

    // Nav links with data-page-link
    document.querySelectorAll('[data-page-link]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const idx = parseInt(el.getAttribute('data-page-link'), 10);
        this.go(idx);
      });
    });

    // Logo goto=0
    document.querySelectorAll('[data-goto]').forEach(el => {
      if (el.tagName === 'BUTTON') return; // dots handled above
      el.addEventListener('click', e => {
        e.preventDefault();
        const idx = parseInt(el.getAttribute('data-goto'), 10);
        this.go(idx);
      });
    });

    // Keyboard arrow keys
    document.addEventListener('keydown', e => {
      if (document.getElementById('navOverlay').classList.contains('open')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); this.go(this.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); this.go(this.current - 1);
      }
    });

    // Swipe support
    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only trigger horizontal swipe if horizontal movement dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) this.go(this.current + 1);
        else this.go(this.current - 1);
      }
    }, { passive: true });
  }

  go(index) {
    if (this.animating) return;
    if (index < 0 || index >= this.total) return;
    if (index === this.current) return;

    this.animating = true;
    const prev = this.current;
    const next = index;
    const dir = next > prev ? 1 : -1;

    const prevPage = this.pages[prev];
    const nextPage = this.pages[next];

    // Scroll next page to top before showing
    nextPage.scrollTop = 0;

    // Set up next page: start slightly offset
    gsap.set(nextPage, {
      opacity: 0,
      x: dir > 0 ? '6%' : '-6%',
      rotateY: dir > 0 ? 8 : -8,
      transformPerspective: 1400,
      transformOrigin: dir > 0 ? 'left center' : 'right center',
    });
    nextPage.classList.add('is-active');
    nextPage.style.pointerEvents = 'none';

    const tl = gsap.timeline({
      onComplete: () => {
        prevPage.classList.remove('is-active', 'is-prev');
        nextPage.style.pointerEvents = '';
        gsap.set(nextPage, { clearProps: 'all' });
        this.current = next;
        this.animating = false;
        this._updateUI();
        this.onPageEnter(next);
      }
    });

    // Animate prev page out
    tl.to(prevPage, {
      opacity: 0,
      x: dir > 0 ? '-4%' : '4%',
      rotateY: dir > 0 ? -6 : 6,
      duration: 0.45,
      ease: 'power2.in',
      transformPerspective: 1400,
      transformOrigin: dir > 0 ? 'right center' : 'left center',
    }, 0);

    // Animate next page in
    tl.to(nextPage, {
      opacity: 1,
      x: '0%',
      rotateY: 0,
      duration: 0.55,
      ease: 'power3.out',
    }, 0.15);

    prevPage.classList.add('is-prev');
  }

  _updateUI() {
    // Counter
    if (this.counter) {
      const n = String(this.current + 1).padStart(2, '0');
      const t = String(this.total).padStart(2, '0');
      this.counter.textContent = `${n} / ${t}`;
    }

    // Dots
    this.dots.forEach((d, i) => {
      d.classList.toggle('active', i === this.current);
    });

    // Arrows
    if (this.btnPrev) this.btnPrev.classList.toggle('hidden', this.current === 0);
    if (this.btnNext) this.btnNext.classList.toggle('hidden', this.current === this.total - 1);
  }

  onPageEnter(index) {
    const page = this.pages[index];
    if (!page) return;

    // Animate counter cards on stats/audience pages
    const cards = page.querySelectorAll('.gsap-counter-card');
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out',
          delay: 0.2,
          onStart: () => initCounters(cards)
        }
      );
    }

    // Animate progress bars on audience pages
    const bars = page.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
      const width = parseFloat(bar.getAttribute('data-width'));
      if (!isNaN(width)) {
        setTimeout(() => { bar.style.width = width + '%'; }, 350);
      }
    });

    // Social phone + text entrance (p-social page)
    if (page.id === 'p4') {
      const phone = page.querySelector('.social-phone-frame');
      const text  = page.querySelector('.social-editorial-text');
      if (phone) gsap.fromTo(phone, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      if (text)  gsap.fromTo(text,  { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 });
    }

    // Annotations subtle entrance
    const annotations = page.querySelectorAll('.annotation');
    if (annotations.length) {
      gsap.fromTo(annotations,
        { opacity: 0, x: 15 },
        { opacity: 0.85, x: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
      );
    }
  }
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

/* ── NAV (hamburger only, no scroll listener) ─────────────── */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navOverlay = document.getElementById('navOverlay');
  const navClose = document.getElementById('navClose');
  const overlayLinks = document.querySelectorAll('.overlay-link');

  function openNav() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = '';
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

/* ── BARCODE GENERATORS ───────────────────────────────────── */
function initBarcodes() {
  ['bmagBarcode1', 'bmagBarcode2', 'contactBarcode'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < 36; i++) {
      const span = document.createElement('span');
      const w = Math.random() > 0.55 ? 3 : (Math.random() > 0.5 ? 2 : 1);
      const h = 10 + Math.random() * 14;
      span.style.cssText = `width:${w}px;height:${h}px`;
      el.appendChild(span);
    }
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
  // Progress bars are now triggered via onPageEnter in MagazineFlip
  // This is a no-op placeholder retained for compatibility
}

/* ── LANGUAGE TOGGLE (EN / ES) ────────────────────────────── */
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;

  const els = document.querySelectorAll('[data-es]');
  els.forEach(el => {
    el.dataset.en = el.innerHTML;
  });

  let isES = false;

  btn.addEventListener('click', () => {
    isES = !isES;
    btn.textContent = isES ? 'ES' : 'EN';
    btn.classList.toggle('es-active', isES);

    els.forEach(el => {
      el.innerHTML = isES ? el.dataset.es : el.dataset.en;
    });
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Set social phone/text opacity:0 before MagazineFlip initialises
  const socialPhone = document.getElementById('socialPhone');
  const socialText  = document.getElementById('socialText');
  if (socialPhone) socialPhone.style.opacity = '0';
  if (socialText)  socialText.style.opacity  = '0';

  initNav();
  initMasthead();
  initBarcodes();
  initProgressBars();
  initLangToggle();
  fetchLiveStats();

  new MagazineFlip();
});
