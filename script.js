// === AGORA SOFTWARE — JS ===

// ── Custom Cursor ─────────────────────
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const isTouch   = () => !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!isTouch()) {
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  const tick = () => {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  document.querySelectorAll('a, button, .si, select').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// ── Navbar scroll ─────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Connected logo transition ─────────
const heroLogo = document.querySelector('.hero-logo-right');
const heroSection = document.querySelector('.hero');
const appbarLogo = document.querySelector('.appbar-logo');
const appbarBrandText = document.querySelector('.appbar-brand-text');

function syncLogoTransition() {
  if (!heroLogo || !heroSection || !appbarLogo || !appbarBrandText) {
    return;
  }

  const compactView = window.innerWidth <= 980;
  if (compactView) {
    heroLogo.style.opacity = '1';
    heroLogo.style.transform = 'translateY(-50%)';
    appbarLogo.style.opacity = '1';
    appbarLogo.style.transform = 'translateY(-50%)';
    appbarBrandText.style.opacity = '0';
    appbarBrandText.style.transform = 'translateY(calc(-50% - 6px))';
    return;
  }

  const fadeDistance = Math.max(heroSection.offsetHeight * 0.34, 180);
  const progress = Math.min(Math.max(window.scrollY / fadeDistance, 0), 1);
  const heroScale = 1 - (progress * 0.12);
  const logoProgress = progress <= 0.28 ? 0 : Math.min((progress - 0.28) / 0.72, 1);
  const navScale = 0.82 + (logoProgress * 0.18);
  const navLift = (1 - logoProgress) * -8;
  const textOpacity = 1 - logoProgress;

  heroLogo.style.opacity = String(1 - progress);
  heroLogo.style.transform = `translateY(-50%) scale(${heroScale})`;
  appbarLogo.style.opacity = String(logoProgress);
  appbarLogo.style.transform = `translateY(calc(-50% + ${navLift}px)) scale(${navScale})`;
  appbarBrandText.style.opacity = String(textOpacity);
  appbarBrandText.style.transform = `translateY(calc(-50% + ${logoProgress * -6}px))`;
}

window.addEventListener('scroll', syncLogoTransition, { passive: true });
window.addEventListener('resize', syncLogoTransition);
syncLogoTransition();

// ── Hamburger ─────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('active');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ── Contact form ──────────────────────
const form      = document.getElementById('contactForm');
const success   = document.getElementById('formSuccess');
const btnText   = document.getElementById('btnText');
const overlay   = document.getElementById('canalOverlay');
const btnEmail  = document.getElementById('btnCanEmail');
const btnWA     = document.getElementById('btnCanWA');
const btnCancel = document.getElementById('btnCanCancel');

function shakeForm() {
  form.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' }
  ], { duration: 400, easing: 'ease' });
}

function validateForm() {
  const botField = form.website ? form.website.value.trim() : '';
  const nombre  = form.nombre.value.trim();
  const contacto = form.email.value.trim();
  const mensaje = form.mensaje.value.trim();

  // Honeypot anti-spam: if this hidden field is filled, treat as bot traffic.
  if (botField) {
    return false;
  }

  if (!nombre || !contacto || !mensaje) { shakeForm(); return false; }

  if (nombre.length > 80 || contacto.length > 120 || mensaje.length > 1200) {
    shakeForm();
    return false;
  }

  return true;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;
  overlay.classList.add('show');
});

btnCancel.addEventListener('click', () => overlay.classList.remove('show'));
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });

function buildContactPayload() {
  const nombre   = form.nombre.value.trim();
  const contacto = form.email.value.trim();
  const empresa  = form.empresa.value.trim();
  const servicio = form.servicio.options[form.servicio.selectedIndex]?.text || 'un servicio';
  const mensaje  = form.mensaje.value.trim();

  const subject = `Nueva consulta desde la web: ${servicio}`;

  const body = [
    '¡Un saludo! Espero que estés muy bien.',
    '',
    `Mi nombre es: ${nombre}`,
    ...(empresa ? [`de la empresa: ${empresa}`] : []),
    '',
    `Quisiera el servicio de: ${servicio}.`,
    '',
    'Con esto en mente:',
    mensaje,
    '',
    'Mis datos de contacto:',
    contacto
  ].join('\n');

  const waText = [
    '¡Un saludo! Espero que estés muy bien.',
    '',
    `*Mi nombre es:* ${nombre}`,
    ...(empresa ? [`*de la empresa:* ${empresa}`] : []),
    '',
    `*Quisiera el servicio de:* ${servicio}.`,
    '',
    '*Con esto en mente:*',
    mensaje,
    '',
    '*Mis datos de contacto:*',
    contacto
  ].join('\n');

  return { subject, body, waText };
}

btnEmail.addEventListener('click', () => {
  overlay.classList.remove('show');
  const { subject, body } = buildContactPayload();
  const mailto = `mailto:contacto@agorasoftware.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  success.classList.add('show');
  form.reset();
  setTimeout(() => success.classList.remove('show'), 6000);
});

btnWA.addEventListener('click', () => {
  overlay.classList.remove('show');
  const { waText } = buildContactPayload();
  window.open('https://wa.me/573115568418?text=' + encodeURIComponent(waText), '_blank', 'noopener');
  success.classList.add('show');
  form.reset();
  setTimeout(() => success.classList.remove('show'), 6000);
});

// ── Scroll reveal ─────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.si, .pillar, .stat-box, .cnt-row, .project-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = `opacity .5s ease ${i * 55}ms, transform .5s ease ${i * 55}ms`;
  revealObs.observe(el);
});
