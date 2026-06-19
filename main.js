/* ─────────────────────────────────────────────────────────
   CHRISTIAN PRIETO PORTFOLIO  ·  main.js
   ───────────────────────────────────────────────────────── */

/* ── SUPABASE CONFIG ──────────────────────────────────────── */
const SUPABASE_URL = 'https://gtnnzhphexfjblujspmr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bm56aHBoZXhmamJsdWpzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzU2NzUsImV4cCI6MjA4Nzg1MTY3NX0.a7zi2U0VeTFpLNQu1Csh-VwjqwaVlKwnbj7T1C27kak';

/* ── UTILITIES ────────────────────────────────────────────── */
function formatNum(value, suffix) {
  if (suffix === 'M') return value.toFixed(1) + 'M';
  if (suffix === 'K') return value >= 100 ? Math.round(value) + 'K' : value.toFixed(1) + 'K';
  if (suffix === '%') return value.toFixed(1) + '%';
  return Math.round(value).toString();
}

function countUp(el, target, suffix, duration = 1800) {
  const start = performance.now();
  const ease  = t => 1 - Math.pow(1 - t, 3);
  (function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = formatNum(ease(p) * target, suffix);
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}

/* ── SUPABASE STATS FETCH ─────────────────────────────────── */
async function fetchLiveStats() {
  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await client.from('portfolio_stats').select('*');
    if (error || !data?.length) return;

    data.forEach(row => {
      document.querySelectorAll(
        `[data-platform="${row.platform}"][data-metric="${row.metric}"]`
      ).forEach(el => {
        el.setAttribute('data-target', row.value);
        el.setAttribute('data-suffix', row.suffix || '');
        el.textContent = formatNum(row.value, row.suffix || '');
      });
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
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('hamburger');
  const navOverlay  = document.getElementById('navOverlay');
  const navClose    = document.getElementById('navClose');
  const overlayLinks= document.querySelectorAll('.overlay-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const openNav = () => {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeNav = () => {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openNav);
  navClose.addEventListener('click', closeNav);
  overlayLinks.forEach(l => l.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

/* ── HERO ENTRANCE ────────────────────────────────────────── */
function initHero() {
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to('#heroLine1',   { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .to('#heroLine2',   { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
    .to('#heroHandle',  { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('#heroStrip',   { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .to('#heroCtas',    { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    .to('#heroTags',    { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to('#heroVisual',  { opacity: 1, duration: 1,   ease: 'power3.out' }, '-=0.6');
}

/* ── SCROLL ANIMATIONS (fade-up, slide) ───────────────────── */
function initScrollAnims() {
  gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  gsap.utils.toArray('.gsap-slide-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    });
  });

  gsap.utils.toArray('.gsap-slide-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    });
  });

  // Video cards
  gsap.utils.toArray('.videos-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.video-card');
    cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(20px)'; });
    gsap.to(cards, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
    });
  });

  // Brand tiles stagger
  gsap.utils.toArray('.brand-tile.gsap-fade-up').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, delay: i * 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.brands-grid', start: 'top 78%', once: true }
    });
  });
}

/* ── APPLE STATS: re-trigger each time section enters view ── */
function initAppleStats() {
  document.querySelectorAll('.section-apple-stats').forEach(section => {
    const nums  = section.querySelectorAll('.apple-num');
    const bars  = section.querySelectorAll('.apple-bar-fill');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Count up all numbers
          nums.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target'));
            const suffix = el.getAttribute('data-suffix') || '';
            if (!isNaN(target)) countUp(el, target, suffix);
          });
          // Animate bars
          bars.forEach(bar => {
            const w = parseFloat(bar.getAttribute('data-width'));
            if (!isNaN(w)) {
              bar.style.width = '0%';
              setTimeout(() => { bar.style.width = w + '%'; }, 200);
            }
          });
        } else {
          // Reset so animation re-fires next time
          nums.forEach(el => { el.textContent = '0'; });
          bars.forEach(bar => { bar.style.width = '0%'; });
        }
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  });
}

/* ── IMAGE PARALLAX ───────────────────────────────────────── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.img-break').forEach(section => {
    const img = section.querySelector('.img-parallax');
    if (!img) return;

    const onScroll = () => {
      const rect   = section.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const offset = (rect.top + rect.height / 2 - center) / window.innerHeight;
      img.style.transform = `translateY(${offset * 15}%)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
}

/* ── BRAND TILE TOUCH SUPPORT ─────────────────────────────── */
function initBrandTiles() {
  document.querySelectorAll('.brand-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const isActive = tile.classList.contains('touch-active');
      document.querySelectorAll('.brand-tile.touch-active').forEach(t => t.classList.remove('touch-active'));
      if (!isActive) tile.classList.add('touch-active');
    });
  });
}

/* ── GALLERY ──────────────────────────────────────────────── */
let galleryImages = [];
let currentLbIndex = 0;

function initGallery() {
  const overlay   = document.getElementById('galleryOverlay');
  const closeBtn  = document.getElementById('galleryClose');
  const fabBtn    = document.getElementById('fabGallery');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  // Collect gallery data
  galleryImages = Array.from(document.querySelectorAll('.gallery-item')).map(item => ({
    src:   item.querySelector('img').src,
    brand: item.getAttribute('data-brand') || '',
    alt:   item.querySelector('img').alt
  }));

  const openGallery = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeGallery = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    closeLightbox();
  };

  fabBtn.addEventListener('click', openGallery);
  closeBtn.addEventListener('click', closeGallery);
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') closeGallery(); });

  // Lightbox
  const openLightbox = (idx) => {
    currentLbIndex = idx;
    lbImg.src      = galleryImages[idx].src;
    lbImg.alt      = galleryImages[idx].alt;
    lbCaption.textContent = galleryImages[idx].brand;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };
  const showNext = () => {
    currentLbIndex = (currentLbIndex + 1) % galleryImages.length;
    openLightbox(currentLbIndex);
  };
  const showPrev = () => {
    currentLbIndex = (currentLbIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(currentLbIndex);
  };

  document.querySelectorAll('.gallery-item').forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click',  showNext);
  lbPrev.addEventListener('click',  showPrev);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'Escape')     closeLightbox();
  });

  // Touch swipe for lightbox
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
  });
}

/* ── IPHONE MODAL ─────────────────────────────────────────── */
function initIphone() {
  const modal     = document.getElementById('iphoneModal');
  const bg        = document.getElementById('iphoneModalBg');
  const closeBtn  = document.getElementById('iphoneClose');
  const fabBtn    = document.getElementById('fabIphone');

  const openIphone  = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  const closeIphone = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };

  fabBtn.addEventListener('click', openIphone);
  closeBtn.addEventListener('click', closeIphone);
  bg.addEventListener('click', closeIphone);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeIphone(); });

  // App actions
  modal.querySelectorAll('.iphone-app').forEach(app => {
    app.addEventListener('click', () => {
      const action = app.getAttribute('data-action');
      switch (action) {
        case 'phone':
          closeIphone();
          window.location.href = 'tel:+34000000000';
          break;
        case 'whatsapp':
          closeIphone();
          window.open('https://wa.me/34000000000', '_blank');
          break;
        case 'email':
          closeIphone();
          window.location.href = 'mailto:chrttprieto@gmail.com';
          break;
        case 'instagram':
          closeIphone();
          window.open('https://instagram.com/chrtt.prieto', '_blank');
          break;
        case 'tiktok':
          closeIphone();
          window.open('https://tiktok.com/@chrtt.prieto', '_blank');
          break;
        case 'gallery':
          closeIphone();
          setTimeout(() => {
            document.getElementById('galleryOverlay').classList.add('open');
            document.getElementById('galleryOverlay').setAttribute('aria-hidden','false');
            document.body.style.overflow = 'hidden';
          }, 300);
          break;
        case 'collab':
          closeIphone();
          setTimeout(() => openCollab(), 300);
          break;
        case 'magazine':
          closeIphone();
          // Magazine coming soon - scroll to contact
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          break;
      }
    });
  });
}

/* ── COLLAB FLASHCARD ─────────────────────────────────────── */
const collabAnswers = {};
let currentStep = 0;
const TOTAL_STEPS = 5;

function openCollab() {
  const modal = document.getElementById('collabModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showCollabStep(0);
}

function closeCollab() {
  const modal = document.getElementById('collabModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showCollabStep(step) {
  currentStep = step;
  document.querySelectorAll('.collab-step').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`.collab-step[data-step="${step}"]`);
  if (target) target.classList.add('active');

  // Update progress bar
  const fill = document.getElementById('collabProgressFill');
  if (fill) {
    const pct = step === 0 ? 0 : step === 6 ? 100 : (step / TOTAL_STEPS) * 100;
    fill.style.width = pct + '%';
  }
}

function buildSummary() {
  const name     = document.getElementById('collabName')?.value.trim()    || '—';
  const contact  = document.getElementById('collabContact')?.value.trim() || '—';
  const vision   = document.getElementById('collabVision')?.value.trim()  || '—';

  collabAnswers.name    = name;
  collabAnswers.contact = contact;
  collabAnswers.vision  = vision;

  const card = document.getElementById('collabSummaryCard');
  const rows = [
    ['Type',      collabAnswers.type     || '—'],
    ['Category',  collabAnswers.category || '—'],
    ['Budget',    collabAnswers.budget   || '—'],
    ['Timeline',  collabAnswers.timeline || '—'],
    ['From',      name],
    ['Contact',   contact],
    ['Vision',    vision],
  ];
  card.innerHTML = rows.map(([k, v]) =>
    `<div class="collab-summary-row"><span class="collab-summary-key">${k}</span><span class="collab-summary-val">${v}</span></div>`
  ).join('');

  // Build message
  const msg = encodeURIComponent(
`Hey Christain! 👋

I'd love to collab with you. Here's my brief:

📋 Type: ${collabAnswers.type || '—'}
🏷 Category: ${collabAnswers.category || '—'}
💰 Budget: ${collabAnswers.budget || '—'}
📅 Timeline: ${collabAnswers.timeline || '—'}
💡 Vision: ${vision}

👤 From: ${name}
📬 Contact: ${contact}

Looking forward to creating something great!`
  );

  const emailBody = encodeURIComponent(
`Hello Christain,

I'm reaching out about a collaboration:

Type: ${collabAnswers.type || '—'}
Category: ${collabAnswers.category || '—'}
Budget: ${collabAnswers.budget || '—'}
Timeline: ${collabAnswers.timeline || '—'}
Vision: ${vision}

From: ${name}
Contact: ${contact}

Best regards`
  );

  const emailSubject = encodeURIComponent(`Collab Inquiry – ${collabAnswers.category || 'Brand'}`);

  const waEl = document.getElementById('collabSendWA');
  if (waEl) waEl.href = `https://wa.me/34000000000?text=${msg}`;

  const emailEl = document.getElementById('collabSendEmail');
  if (emailEl) emailEl.href = `mailto:chrttprieto@gmail.com?subject=${emailSubject}&body=${emailBody}`;
}

function initCollab() {
  const modal    = document.getElementById('collabModal');
  const backdrop = document.getElementById('collabBackdrop');
  const closeBtn = document.getElementById('collabClose');

  // Open triggers
  document.getElementById('collabTriggerAbout')?.addEventListener('click', openCollab);

  // Close
  closeBtn.addEventListener('click', closeCollab);
  backdrop.addEventListener('click', closeCollab);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeCollab();
  });

  // Intro "Get Started" button
  modal.querySelector('[data-next="1"]')?.addEventListener('click', () => showCollabStep(1));

  // Option selection (auto-advance after pick)
  modal.querySelectorAll('.collab-options').forEach(group => {
    const field = group.getAttribute('data-field');
    group.querySelectorAll('.collab-option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.collab-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        collabAnswers[field] = btn.textContent.trim();
        // Advance after short delay
        setTimeout(() => {
          const parentStep = parseInt(group.closest('.collab-step').getAttribute('data-step'));
          showCollabStep(parentStep + 1);
        }, 380);
      });
    });
  });

  // Submit step 5
  document.getElementById('collabSubmitBtn')?.addEventListener('click', () => {
    buildSummary();
    showCollabStep(6);
  });
}

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initNav();
  initHero();
  initScrollAnims();
  initAppleStats();
  initParallax();
  initBrandTiles();
  initGallery();
  initIphone();
  initCollab();
  fetchLiveStats();
});
