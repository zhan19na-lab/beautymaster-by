/* ============================================================
   BEAUTYMASTER.BY — Main JS
   ============================================================ */

/* ── Particles Canvas ──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size  = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.25;
    this.speedY = (Math.random() - 0.5) * 0.15 - 0.05;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.pulse = Math.random() * Math.PI * 2;
  }
  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    this.pulse += 0.012;
    this.opacity = 0.15 + Math.sin(this.pulse) * 0.12;
    if (this.y < -10) { this.y = H + 10; this.x = Math.random() * W; }
    if (this.x < -10) this.x = W + 10;
    if (this.x > W + 10) this.x = -10;
  };
  Particle.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#C9A96E';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#C9A96E';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 14000), 90);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  loop();
})();

/* ── Nav scroll effect ─────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile menu ───────────────────────────────────────────── */
(function initMobileMenu() {
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  let open = false;
  burger.addEventListener('click', () => {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    const spans = burger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4.5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4.5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      open = false;
      menu.classList.remove('open');
      document.body.style.overflow = '';
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── Direction card: pre-fill select ──────────────────────── */
(function initDirCards() {
  document.querySelectorAll('.dir-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const dir = card.dataset.dir;
      const sel = document.getElementById('reg-direction');
      if (sel && dir) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === dir) {
            sel.selectedIndex = i;
            break;
          }
        }
      }
    });
  });
})();

/* ── Validation helpers ────────────────────────────────────── */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('input-error');
  let hint = el.parentElement.querySelector('.field-error');
  if (!hint) {
    hint = document.createElement('p');
    hint.className = 'field-error';
    el.parentElement.appendChild(hint);
  }
  hint.textContent = msg;
  const clear = () => {
    el.classList.remove('input-error');
    hint.textContent = '';
    el.removeEventListener('input', clear);
    el.removeEventListener('change', clear);
  };
  el.addEventListener('input', clear);
  el.addEventListener('change', clear);
}

function isValidContact(val) {
  return /^[\+\d][\d\s\-\(\)]{6,}$/.test(val);
}

function isValidPhone(val) {
  const digitsOnly = val.replace(/\D/g, '');
  return val.startsWith('+') && digitsOnly.length >= 11 && digitsOnly.length <= 12;
}

function isValidTg(val) {
  // @username: 5-32 chars, only latin letters, digits, underscore
  return /^@[a-zA-Z0-9_]{5,32}$/.test(val);
}

function capitalizeFirst(val) {
  if (!val) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function isValidName(val) {
  // At least 2 chars, first char must be a letter (any language)
  return val.length >= 2 && /^\p{L}/u.test(val);
}

/* ── Registration Form ─────────────────────────────────────── */
(function initRegForm() {
  const form    = document.getElementById('reg-form');
  const success = document.getElementById('reg-success');
  if (!form) return;

  // Auto-capitalize name on blur
  const nameInput = document.getElementById('reg-name');
  nameInput?.addEventListener('blur', () => {
    nameInput.value = capitalizeFirst(nameInput.value.trim());
  });

  // Auto-add @ to tg if missing
  const tgInput = document.getElementById('reg-tg');
  tgInput?.addEventListener('blur', () => {
    const v = tgInput.value.trim();
    if (v && !v.startsWith('@')) tgInput.value = '@' + v;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameRaw = document.getElementById('reg-name').value.trim();
    const name    = capitalizeFirst(nameRaw);
    document.getElementById('reg-name').value = name;

    const dir     = document.getElementById('reg-direction').value;
    const contact = document.getElementById('reg-contact').value.trim();
    const tgRaw   = document.getElementById('reg-tg')?.value.trim() || '';
    const tg      = tgRaw && !tgRaw.startsWith('@') ? '@' + tgRaw : tgRaw;

    let valid = true;

    if (!name || !isValidName(name)) {
      showError('reg-name', 'Введите имя — первая буква должна быть заглавной');
      valid = false;
    }
    if (!dir) {
      showError('reg-direction', 'Выберите направление');
      valid = false;
    }
    if (!contact) {
      showError('reg-contact', 'Введите номер телефона');
      valid = false;
    } else if (!isValidPhone(contact)) {
      showError('reg-contact', 'Формат: +375XXXXXXXXX (с плюсом, 11-12 цифр)');
      valid = false;
    }
    if (!tg) {
      showError('reg-tg', 'Введите ник Telegram — он обязателен');
      valid = false;
    } else if (!isValidTg(tg)) {
      showError('reg-tg', 'Формат: @username (латиница, минимум 5 символов)');
      valid = false;
    }

    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>Создаём страницу...</span>';

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, direction: dir, contact, tgUsername: tg })
    })
      .catch(() => {})
      .finally(() => {
        form.style.display = 'none';
        success.style.display = 'flex';
      });
  });
})();

/* ── Smooth scroll for anchor links ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
