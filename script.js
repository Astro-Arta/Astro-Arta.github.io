// ---------------------------------------------------------
// Accessibility + motion preference
// ---------------------------------------------------------
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;

// ---------------------------------------------------------
// Starfield canvas — capped for smoother performance
// ---------------------------------------------------------
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d', { alpha: true });
let stars = [];
let animationFrame = null;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(
    180,
    Math.max(55, Math.floor((window.innerWidth * window.innerHeight) / 11000))
  );

  stars = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.15 + 0.2,
    baseAlpha: Math.random() * 0.55 + 0.18,
    twinkleSpeed: Math.random() * 0.012 + 0.002,
    phase: Math.random() * Math.PI * 2
  }));

  drawStars(0);
}

function drawStars(time) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = '#f5f3ff';

  for (const star of stars) {
    const alpha = prefersReducedMotion
      ? star.baseAlpha
      : star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.phase) * 0.22;

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function animateStars(time) {
  drawStars(time);
  if (!prefersReducedMotion) animationFrame = requestAnimationFrame(animateStars);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });
animationFrame = requestAnimationFrame(animateStars);

motionQuery.addEventListener('change', (event) => {
  prefersReducedMotion = event.matches;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  drawStars(0);
  if (!prefersReducedMotion) animationFrame = requestAnimationFrame(animateStars);
});

// ---------------------------------------------------------
// Navigation: scroll state, mobile menu, active section
// ---------------------------------------------------------
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navAnchors = [...navLinks.querySelectorAll('a')];
const sections = [...document.querySelectorAll('main .section')];

function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navAnchors.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      navAnchors.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

// ---------------------------------------------------------
// Scroll reveal
// ---------------------------------------------------------
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((section) => revealObserver.observe(section));
} else {
  sections.forEach((section) => section.classList.add('in-view'));
}

// ---------------------------------------------------------
// Back to top
// ---------------------------------------------------------
document.getElementById('toTop').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });
});
