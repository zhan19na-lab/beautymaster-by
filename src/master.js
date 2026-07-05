/* ── BeautyMaster.by — Dynamic Master Page ─── */

const DAYS_RU = { mon:'Понедельник', tue:'Вторник', wed:'Среда', thu:'Четверг', fri:'Пятница', sat:'Суббота', sun:'Воскресенье' };
const DAYS_ORDER = ['mon','tue','wed','thu','fri','sat','sun'];
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

let masterData = null;

/* ── Get slug from URL ─── */
function getSlug() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
}

/* ── Initials from name ─── */
function initials(name) {
  return (name || '').split(' ').slice(0,2).map(w => w[0]?.toUpperCase() || '').join('');
}

/* ── Load master data ─── */
async function loadMaster() {
  const slug = getSlug();
  try {
    const r = await fetch(`/api/get-master?slug=${slug}`);
    if (!r.ok) throw new Error('Not found');
    return await r.json();
  } catch {
    return null;
  }
}

/* ── Render page ─── */
function renderPage(d) {
  masterData = d;

  // SEO
  const title = `${d.name} — ${d.specialty || 'Мастер красоты'} · ${d.city || 'Беларусь'}`;
  document.getElementById('page-title').textContent = title;
  document.getElementById('meta-desc').setAttribute('content', `Запишитесь к ${d.name} онлайн. ${d.specialty || ''} в ${d.city || 'Беларуси'}.`);
  document.getElementById('og-title').setAttribute('content', title);
  document.getElementById('og-desc').setAttribute('content', `Онлайн-запись к мастеру ${d.name}`);

  // Hero
  document.getElementById('master-name').textContent = d.name || 'Мастер';
  document.getElementById('master-spec').textContent = `💅 ${d.specialty || 'Мастер красоты'}`;
  document.getElementById('master-city').textContent = `${d.city || 'Беларусь'} · Принимаю на дому`;
  document.getElementById('master-bio').textContent = d.bio || '';
  const taglineEl = document.getElementById('master-tagline');
  if (taglineEl) {
    if (d.tagline) { taglineEl.textContent = `«${d.tagline}»`; taglineEl.style.display = 'block'; }
    else { taglineEl.style.display = 'none'; }
  }
  document.getElementById('booking-title').textContent = 'Онлайн-запись к мастеру';
  document.getElementById('footer-copy').textContent = `© 2025 ${d.name} · Все права защищены`;

  // Avatar
  if (d.photo) {
    const img = document.getElementById('master-avatar-photo');
    img.src = d.photo;
    img.style.display = 'block';
    document.getElementById('master-avatar-initials').style.display = 'none';
  } else {
    document.getElementById('master-avatar-initials').textContent = initials(d.name);
  }

  // Stats
  if (d.stats) {
    document.getElementById('stat-works').textContent = d.stats.works || '0';
    document.getElementById('stat-rating').textContent = d.stats.rating || '5.0';
    document.getElementById('stat-clients').textContent = d.stats.clients || '0';
  }

  // Socials
  const socials = document.getElementById('master-socials');
  socials.innerHTML = '';
  if (d.instagram) {
    socials.innerHTML += `<a href="${d.instagram}" class="social-btn" target="_blank" aria-label="Instagram">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
    </a>`;
  }
  if (d.tiktok) {
    socials.innerHTML += `<a href="${d.tiktok}" class="social-btn" target="_blank" aria-label="TikTok">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.86 4.86 0 01-1.01-.09z"/></svg>
    </a>`;
  }

  // Services list
  const services = d.services || [];
  const sl = document.getElementById('services-list');
  sl.innerHTML = services.map(s => `
    <div class="service-row">
      <div class="service-info">
        <span class="service-name">${s.name}</span>
        <span class="service-desc">${s.desc || ''}</span>
      </div>
      <span class="service-price">${s.price}</span>
      <a href="#booking" class="service-book-btn">Записаться</a>
    </div>
  `).join('');

  // Booking services
  const bg = document.getElementById('booking-services');
  bg.innerHTML = services.map(s => `
    <label class="service-radio-card">
      <input type="radio" name="service" value="${s.name} · ${s.price}" />
      <div class="src-inner">
        <span class="src-name">${s.name}</span>
        <span class="src-price">${s.price}</span>
      </div>
    </label>
  `).join('');

  // Contact info
  if (d.phone) {
    document.getElementById('contact-phone-block').style.display = 'flex';
    document.getElementById('contact-phone').textContent = d.phone;
  }

  // Schedule / hours table
  renderHoursTable(d.schedule);

  // Show page
  document.getElementById('page-loading').style.display = 'none';
  document.getElementById('page-content').style.display = 'block';

  // Init all interactive parts
  initReveal();
  initCalendar(d.schedule);
  initBookingForm();
  initContactModal();
  initSmoothScroll();
}

/* ── Hours table ─── */
function renderHoursTable(schedule) {
  const t = document.getElementById('hours-table');
  if (!schedule) {
    t.innerHTML = '<p style="color:var(--muted);font-size:0.85rem;">Уточняйте у мастера</p>';
    return;
  }
  t.innerHTML = DAYS_ORDER.map(d => {
    const day = schedule[d];
    if (!day || !day.enabled) {
      return `<div class="hours-row hours-row--off"><span class="hours-day">${DAYS_RU[d]}</span><span class="hours-time">Выходной</span></div>`;
    }
    return `<div class="hours-row"><span class="hours-day">${DAYS_RU[d]}</span><span class="hours-time">${day.from} — ${day.to}</span></div>`;
  }).join('');
}

/* ── Calendar with schedule awareness ─── */
function initCalendar(schedule) {
  const wrap = document.getElementById('calendar-wrap');
  if (!wrap) return;

  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let selectedDate = null;

  const DOW_MAP = ['sun','mon','tue','wed','thu','fri','sat'];

  function isWorkDay(date) {
    if (!schedule) return true;
    const dow = DOW_MAP[date.getDay()];
    return schedule[dow]?.enabled === true;
  }

  function render() {
    wrap.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `<button class="cal-nav-btn" id="cal-prev">‹</button><span class="cal-month-label">${MONTHS_RU[viewMonth]} ${viewYear}</span><button class="cal-nav-btn" id="cal-next">›</button>`;
    wrap.appendChild(header);

    const weekdays = document.createElement('div');
    weekdays.className = 'cal-weekdays';
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-weekday';
      el.textContent = d;
      weekdays.appendChild(el);
    });
    wrap.appendChild(weekdays);

    const grid = document.createElement('div');
    grid.className = 'cal-days';

    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    for (let i = 0; i < startDow; i++) {
      const e = document.createElement('div');
      e.className = 'cal-day cal-day--empty';
      grid.appendChild(e);
    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      dayEl.textContent = d;
      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast = thisDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isToday = thisDate.toDateString() === now.toDateString();
      const isSel = selectedDate && selectedDate.d === d && selectedDate.m === viewMonth && selectedDate.y === viewYear;
      const isOff = !isWorkDay(thisDate);

      if (isPast || isOff) {
        dayEl.classList.add(isOff && !isPast ? 'cal-day--off' : 'cal-day--past');
        if (isOff && !isPast) dayEl.title = 'Выходной день';
      } else {
        if (isToday) dayEl.classList.add('cal-day--today');
        if (isSel) dayEl.classList.add('cal-day--selected');
        dayEl.addEventListener('click', () => {
          selectedDate = { d, m: viewMonth, y: viewYear };
          window.__bookingDate = `${d} ${MONTHS_RU[viewMonth].toLowerCase()} ${viewYear}`;
          render();
          renderTimeSlots(thisDate);
        });
      }
      grid.appendChild(dayEl);
    }
    wrap.appendChild(grid);

    document.getElementById('cal-prev')?.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
    document.getElementById('cal-next')?.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
  }
  render();
}

/* ── Time slots based on schedule ─── */
function renderTimeSlots(date) {
  const container = document.getElementById('time-slots');
  if (!container) return;

  const DOW_MAP = ['sun','mon','tue','wed','thu','fri','sat'];
  const dow = DOW_MAP[date.getDay()];
  const schedule = masterData?.schedule;
  const daySchedule = schedule?.[dow];
  const bookedSlots = masterData?.bookedSlots || [];

  const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

  let slots = [];
  if (daySchedule?.enabled) {
    const [fromH] = daySchedule.from.split(':').map(Number);
    const [toH]   = daySchedule.to.split(':').map(Number);
    for (let h = fromH; h < toH; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
    }
  }

  if (!slots.length) {
    container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px;">Нет доступного времени в этот день</p>';
    return;
  }

  container.innerHTML = slots.map(t => {
    const isBooked = bookedSlots.includes(`${dateKey}-${t}`);
    return `<button type="button" class="time-slot${isBooked ? ' time-slot--booked' : ''}" data-time="${t}" ${isBooked ? 'disabled' : ''}>${t}</button>`;
  }).join('');

  container.querySelectorAll('.time-slot:not(.time-slot--booked)').forEach(slot => {
    slot.addEventListener('click', () => {
      container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      window.__bookingTime = slot.dataset.time;
    });
  });
}

/* ── Shared booking submit helper ─── */
async function sendBooking(payload) {
  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && !!data.success;
  } catch {
    return false;
  }
}

/* ── Booking form ─── */
function isValidPhone(v) {
  if (!/^\+[\d\s\-()]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 11 && digits.length <= 12;
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('input-error');
  let h = el.parentElement.querySelector('.field-error');
  if (!h) { h = document.createElement('p'); h.className = 'field-error'; el.parentElement.appendChild(h); }
  h.textContent = msg;
  const clear = () => { el.classList.remove('input-error'); h.textContent = ''; el.removeEventListener('input', clear); };
  el.addEventListener('input', clear);
}

window.bookingNext = function(fromStep) {
  if (fromStep === 1) {
    if (!document.querySelector('[name="service"]:checked')) {
      shakeStep(1);
      let h = document.querySelector('#bstep-1 .bstep-err') || (() => { const p = document.createElement('p'); p.className = 'bstep-err field-error'; p.style.cssText = 'text-align:center;margin-top:12px;'; document.querySelector('#bstep-1 .service-radio-grid').after(p); return p; })();
      h.textContent = 'Пожалуйста, выберите услугу';
      return;
    }
    window.__bookingService = document.querySelector('[name="service"]:checked').value;
  }
  if (fromStep === 2 && !window.__bookingDate) {
    shakeStep(2);
    let h = document.querySelector('#bstep-2 .bstep-err') || (() => { const p = document.createElement('p'); p.className = 'bstep-err field-error'; p.style.cssText = 'text-align:center;margin-top:12px;'; document.getElementById('calendar-wrap').after(p); return p; })();
    h.textContent = 'Пожалуйста, выберите дату';
    return;
  }
  if (fromStep === 3 && !window.__bookingTime) {
    shakeStep(3);
    let h = document.querySelector('#bstep-3 .bstep-err') || (() => { const p = document.createElement('p'); p.className = 'bstep-err field-error'; p.style.cssText = 'text-align:center;margin-top:12px;'; document.getElementById('time-slots').after(p); return p; })();
    h.textContent = 'Пожалуйста, выберите время';
    return;
  }

  document.getElementById(`bstep-${fromStep}`)?.classList.remove('active');
  document.getElementById(`bstep-${fromStep + 1}`)?.classList.add('active');
  document.querySelectorAll('.bstep').forEach(s => {
    const n = parseInt(s.dataset.step);
    if (n < fromStep + 1) s.classList.add('done');
    if (n === fromStep + 1) s.classList.add('active');
  });

  if (fromStep === 3) {
    const sum = document.getElementById('booking-summary');
    if (sum) sum.innerHTML = `<strong style="color:var(--gold-light)">Ваша запись:</strong><br>Услуга: ${window.__bookingService||'—'}<br>Дата: ${window.__bookingDate||'—'}<br>Время: ${window.__bookingTime||'—'}`;
  }
};

function shakeStep(step) {
  const el = document.getElementById(`bstep-${step}`);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
}

function initBookingForm() {
  const form = document.getElementById('booking-form');
  const succ = document.getElementById('booking-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('b-name').value.trim();
    const phone = document.getElementById('b-phone').value.trim();
    let valid = true;
    if (!name || name.length < 2) { showErr('b-name', 'Введите ваше имя'); valid = false; }
    if (!phone) { showErr('b-phone', 'Введите номер телефона'); valid = false; }
    else if (!isValidPhone(phone)) { showErr('b-phone', 'Неверный формат. Пример: +375291234567'); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('.btn-submit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    const ok = await sendBooking({
      type: 'booking', name, phone,
      service: window.__bookingService || '—',
      date: window.__bookingDate || '—',
      time: window.__bookingTime || '—',
      masterUsername: masterData?.tgUsername
    });

    if (!ok) {
      btn.disabled = false;
      btn.textContent = originalText;
      showErr('b-phone', 'Не удалось отправить заявку. Проверьте связь и попробуйте ещё раз.');
      return;
    }

    document.querySelector('.booking-wrap').innerHTML = '';
    succ.style.display = 'flex';
    document.querySelector('.booking-wrap').appendChild(succ);
  });

  document.querySelectorAll('.bform-input').forEach(el => el.addEventListener('input', () => el.classList.remove('input-error')));
}

/* ── Contact modal ─── */
function initContactModal() {
  const fab     = document.getElementById('contact-fab');
  const overlay = document.getElementById('contact-modal-overlay');
  const closeBtn = document.getElementById('contact-modal-close');

  fab?.addEventListener('click', () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay?.classList.remove('open'); });

  document.querySelectorAll('.contact-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.contact-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.contact-tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`ctab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  function showCErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('input-error');
    let h = el.parentElement.querySelector('.field-error');
    if (!h) { h = document.createElement('p'); h.className = 'field-error'; el.parentElement.appendChild(h); }
    h.textContent = msg;
    const clear = () => { el.classList.remove('input-error'); h.textContent = ''; el.removeEventListener('input', clear); };
    el.addEventListener('input', clear);
  }

  document.getElementById('contact-form-order')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const message = document.getElementById('co-message').value.trim();
    let valid = true;
    if (!name || name.length < 2) { showCErr('co-name', 'Введите ваше имя'); valid = false; }
    if (!phone) { showCErr('co-phone', 'Введите номер телефона'); valid = false; }
    else if (!isValidPhone(phone)) { showCErr('co-phone', 'Неверный формат. Пример: +375291234567'); valid = false; }
    if (!message || message.length < 3) { showCErr('co-message', 'Опишите что вы хотите'); valid = false; }
    if (!valid) return;
    const btn = e.target.querySelector('.cform-submit');
    const originalText = btn.textContent;
    btn.disabled = true; btn.textContent = 'Отправляем...';
    const ok = await sendBooking({ type: 'order', name, phone, message, masterUsername: masterData?.tgUsername });
    if (!ok) {
      btn.disabled = false;
      btn.textContent = originalText;
      showCErr('co-message', 'Не удалось отправить. Проверьте связь и попробуйте ещё раз.');
      return;
    }
    e.target.style.display = 'none';
    document.getElementById('corder-success').style.display = 'flex';
  });

  document.getElementById('contact-form-callback')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('cc-name').value.trim();
    const phone = document.getElementById('cc-phone').value.trim();
    let valid = true;
    if (!name || name.length < 2) { showCErr('cc-name', 'Введите ваше имя'); valid = false; }
    if (!phone) { showCErr('cc-phone', 'Введите номер телефона'); valid = false; }
    else if (!isValidPhone(phone)) { showCErr('cc-phone', 'Неверный формат. Пример: +375291234567'); valid = false; }
    if (!valid) return;
    const btn = e.target.querySelector('.cform-submit');
    const originalText = btn.textContent;
    btn.disabled = true; btn.textContent = 'Отправляем...';
    const ok = await sendBooking({ type: 'callback', name, phone, masterUsername: masterData?.tgUsername });
    if (!ok) {
      btn.disabled = false;
      btn.textContent = originalText;
      showCErr('cc-phone', 'Не удалось отправить. Проверьте связь и попробуйте ещё раз.');
      return;
    }
    e.target.style.display = 'none';
    document.getElementById('ccallback-success').style.display = 'flex';
  });

  document.querySelectorAll('.cform-input').forEach(el => el.addEventListener('input', () => el.classList.remove('input-error')));
}

/* ── Reveal ─── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ── Smooth scroll ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const navH = document.querySelector('.pnav')?.offsetHeight || 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
      }
    });
  });
}

/* ── Owner check ─── */
async function checkOwner() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return false;
  const slug = getSlug();
  try {
    const r = await fetch(`/api/verify-token?slug=${slug}&token=${token}`);
    const d = await r.json();
    return d.valid === true;
  } catch { return false; }
}

/* ── Owner edit mode ─── */
async function initOwnerMode() {
  const isOwner = await checkOwner();
  if (!isOwner) return;

  const params  = new URLSearchParams(window.location.search);
  const token   = params.get('token');
  const slug    = getSlug();

  // Show edit hint bar
  const hint = document.createElement('div');
  hint.className = 'edit-hint-bar';
  hint.innerHTML = '✎ &nbsp;Дважды кликни на имя, описание или цену — чтобы изменить прямо здесь';
  document.querySelector('.pnav')?.after(hint);

  // Public link panel — always visible while editing
  const publicUrl = `https://beautymaster-by.vercel.app/master/${slug}`;
  const linkBar = document.createElement('div');
  linkBar.style.cssText = `position:fixed;bottom:0;left:0;right:0;background:#111;border-top:1px solid rgba(201,169,110,0.25);padding:10px 16px calc(10px + env(safe-area-inset-bottom)) 16px;display:flex;align-items:center;gap:10px;z-index:9000;`;
  linkBar.innerHTML = `
    <span style="color:#6A6A6A;font-size:0.75rem;white-space:nowrap;">👁 Ссылка для клиентов:</span>
    <span id="owner-pub-url" style="color:#C9A96E;font-size:0.78rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${publicUrl}</span>
    <button id="owner-copy-btn" style="background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.3);color:#C9A96E;font-size:0.75rem;padding:6px 12px;border-radius:4px;cursor:pointer;white-space:nowrap;">Скопировать</button>
  `;
  document.body.appendChild(linkBar);
  document.getElementById('owner-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      const btn = document.getElementById('owner-copy-btn');
      btn.textContent = '✓ Скопировано';
      setTimeout(() => { btn.textContent = 'Скопировать'; }, 2000);
    });
  });

  // Show welcome instruction modal (once)
  const storageKey = `bm-guide-${slug}`;
  if (!localStorage.getItem(storageKey)) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;`;
    overlay.innerHTML = `
      <div style="background:#111;border:1px solid rgba(201,169,110,0.3);border-radius:12px;max-width:480px;width:100%;padding:32px 28px;position:relative;max-height:90vh;overflow-y:auto;">
        <button id="guide-close" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#6A6A6A;font-size:20px;cursor:pointer;line-height:1;">✕</button>
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:2rem;margin-bottom:8px;">✦</div>
          <h2 style="font-family:'Cormorant Garant',serif;font-size:1.6rem;color:#F5F0E8;margin-bottom:6px;">Добро пожаловать!</h2>
          <p style="color:#E8D5B0;font-size:0.85rem;font-style:italic;">Вы в личном кабинете мастера. Вот как настроить свою страницу:</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="min-width:32px;height:32px;border-radius:50%;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:center;color:#C9A96E;font-size:0.85rem;font-weight:600;">1</div>
            <div><p style="color:#F5F0E8;font-size:0.9rem;margin-bottom:2px;"><strong>Фото профиля</strong></p><p style="color:#E8D5B0;font-size:0.82rem;font-style:italic;">Нажмите на золотую кнопку ↑ в правом углу аватара → выберите фото с телефона</p></div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="min-width:32px;height:32px;border-radius:50%;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:center;color:#C9A96E;font-size:0.85rem;font-weight:600;">2</div>
            <div><p style="color:#F5F0E8;font-size:0.9rem;margin-bottom:2px;"><strong>Имя и описание</strong></p><p style="color:#E8D5B0;font-size:0.82rem;font-style:italic;">Дважды кликните на имя, город или текст о себе → напишите своё → нажмите Enter</p></div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="min-width:32px;height:32px;border-radius:50%;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:center;color:#C9A96E;font-size:0.85rem;font-weight:600;">3</div>
            <div><p style="color:#F5F0E8;font-size:0.9rem;margin-bottom:2px;"><strong>Фото работ</strong></p><p style="color:#E8D5B0;font-size:0.82rem;font-style:italic;">Прокрутите вниз до раздела "Портфолио" → нажмите плитку с + → выберите фото работы</p></div>
          </div>
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="min-width:32px;height:32px;border-radius:50%;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.3);display:flex;align-items:center;justify-content:center;color:#C9A96E;font-size:0.85rem;font-weight:600;">4</div>
            <div><p style="color:#F5F0E8;font-size:0.9rem;margin-bottom:2px;"><strong>Ссылка для клиентов</strong></p><p style="color:#E8D5B0;font-size:0.82rem;font-style:italic;">Публичная ссылка из Telegram — делитесь ею в Instagram и TikTok</p></div>
          </div>
        </div>
        <div style="margin-top:8px;padding:12px;background:rgba(201,169,110,0.07);border-radius:8px;border-left:3px solid #C9A96E;">
          <p style="color:#C9A96E;font-size:0.8rem;">⚠️ Эту ссылку (с токеном в адресе) никому не передавайте — по ней можно редактировать ваш профиль</p>
        </div>
        <button id="guide-start" style="width:100%;margin-top:20px;padding:14px;background:#C9A96E;border:none;border-radius:6px;color:#0A0A0A;font-size:0.9rem;font-weight:600;cursor:pointer;letter-spacing:0.05em;">Понятно, начать настройку →</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const close = () => {
      overlay.remove();
      localStorage.setItem(storageKey, '1');
    };
    document.getElementById('guide-close').addEventListener('click', close);
    document.getElementById('guide-start').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  // Show avatar upload button
  const avatarBtn = document.getElementById('avatar-upload-btn');
  const avatarInput = document.getElementById('avatar-file-input');
  if (avatarBtn) avatarBtn.style.display = 'flex';

  // Show portfolio add button
  const addBtn = document.getElementById('portfolio-add-btn');
  if (addBtn) addBtn.style.display = 'block';

  function showToast(msg, ok = true) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#141414;border:1px solid ${ok ? 'var(--gold-border)' : '#c0392b'};color:${ok ? '#81C784' : '#e74c3c'};font-size:0.82rem;padding:10px 24px;z-index:9999;border-radius:4px;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  async function uploadPhoto(file, photoType) {
    const maxMb = photoType === 'avatar' ? 5 : 10;
    if (!file.type.startsWith('image/')) { showToast('Можно загружать только изображения', false); return; }
    if (file.size > maxMb * 1024 * 1024) { showToast(`Файл слишком большой (максимум ${maxMb} МБ)`, false); return; }
    showToast(photoType === 'avatar' ? 'Загружаем аватарку...' : 'Загружаем фото...');
    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-slug': slug, 'x-token': token, 'x-photo-type': photoType },
        body: file
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Ошибка');
      if (photoType === 'avatar') {
        const img = document.getElementById('master-avatar-photo');
        const ini = document.getElementById('master-avatar-initials');
        if (img) { img.src = data.url; img.style.display = 'block'; }
        if (ini) ini.style.display = 'none';
        showToast('✓ Аватарка обновлена');
      } else {
        const grid = document.getElementById('portfolio-grid');
        const addBtnEl = document.getElementById('portfolio-add-btn');
        const item = document.createElement('div');
        item.className = 'portfolio-item reveal';
        item.innerHTML = `<img src="${data.url}" alt="Работа мастера" loading="lazy" /><div class="portfolio-overlay"><span>Моя работа</span></div>`;
        if (grid && addBtnEl) grid.insertBefore(item, addBtnEl);
        else if (grid) grid.appendChild(item);
        showToast('✓ Фото добавлено в портфолио');
      }
    } catch (err) { showToast('Ошибка: ' + err.message, false); }
  }

  avatarInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file, 'avatar');
    avatarInput.value = '';
  });
  avatarBtn?.addEventListener('click', () => avatarInput?.click());

  const portfolioInput = document.getElementById('portfolio-file-input');
  addBtn?.addEventListener('click', () => portfolioInput?.click());
  portfolioInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file, 'portfolio');
    portfolioInput.value = '';
  });

  // Inline editing
  function makeEditable(el, onSave) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.title = 'Дважды кликни, чтобы изменить';
    el.addEventListener('dblclick', () => {
      const original = el.textContent;
      const inp = document.createElement('input');
      inp.value = original;
      inp.style.cssText = `background:transparent;border:none;border-bottom:1px solid var(--gold);color:inherit;font-size:inherit;padding:2px 0;font-family:inherit;outline:none;width:100%;`;
      el.replaceWith(inp);
      inp.focus(); inp.select();
      const save = () => {
        const val = inp.value.trim() || original;
        el.textContent = val;
        inp.replaceWith(el);
        onSave(val);
      };
      inp.addEventListener('blur', save);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') inp.replaceWith(el); });
    });
  }

  makeEditable(document.getElementById('master-name'), val => saveField('name', val));
  makeEditable(document.getElementById('master-bio'),  val => saveField('bio', val));
  makeEditable(document.getElementById('master-city'), val => saveField('city', val));

  async function saveField(field, val) {
    const updated = { ...masterData, [field]: val };
    await fetch('/api/save-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updated, slug, token })
    }).catch(() => {});
    masterData = updated;
    showToast('✓ Сохранено');
  }

  async function saveServices(services) {
    masterData = { ...masterData, services };
    await fetch('/api/save-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...masterData, slug, token })
    }).catch(() => {});
    showToast('✓ Услуги сохранены');
  }

  // Services editing for owner
  function initServicesEdit() {
    const sl = document.getElementById('services-list');
    if (!sl) return;

    // Re-render with edit controls
    function renderServices() {
      const services = masterData.services || [];
      sl.innerHTML = services.map((s, i) => `
        <div class="service-row" data-index="${i}">
          <div class="service-info">
            <span class="service-name owner-editable" data-field="name" data-index="${i}" title="Двойной клик — изменить">${s.name}</span>
            <span class="service-desc owner-editable" data-field="desc" data-index="${i}" title="Двойной клик — изменить">${s.desc || ''}</span>
          </div>
          <span class="service-price owner-editable" data-field="price" data-index="${i}" title="Двойной клик — изменить цену">${s.price}</span>
          <button class="service-delete-btn" data-index="${i}" style="background:none;border:1px solid rgba(201,169,110,0.2);color:#6A6A6A;cursor:pointer;padding:4px 8px;border-radius:4px;font-size:0.75rem;margin-left:8px;" title="Удалить услугу">✕</button>
          <a href="#booking" class="service-book-btn">Записаться</a>
        </div>
      `).join('') + `
        <button id="add-service-btn" style="margin-top:16px;width:100%;padding:12px;background:rgba(201,169,110,0.07);border:1px dashed rgba(201,169,110,0.3);color:#C9A96E;cursor:pointer;border-radius:6px;font-size:0.85rem;letter-spacing:0.05em;">+ Добавить услугу</button>
      `;

      // Double-click editing for service fields
      sl.querySelectorAll('.owner-editable').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('dblclick', () => {
          const idx = parseInt(el.dataset.index);
          const field = el.dataset.field;
          const original = el.textContent;
          const inp = document.createElement('input');
          inp.value = original;
          inp.style.cssText = `background:transparent;border:none;border-bottom:1px solid var(--gold);color:inherit;font-size:inherit;padding:2px 0;font-family:inherit;outline:none;width:100%;`;
          el.replaceWith(inp);
          inp.focus(); inp.select();
          const save = () => {
            let val = inp.value.trim() || original;
            if (field === 'price' && !/\d/.test(val)) {
              showToast('Цена должна содержать хотя бы одну цифру', false);
              val = original;
            }
            el.textContent = val;
            inp.replaceWith(el);
            const services = [...(masterData.services || [])];
            services[idx] = { ...services[idx], [field]: val };
            saveServices(services);
          };
          inp.addEventListener('blur', save);
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') inp.replaceWith(el); });
        });
      });

      // Delete service
      sl.querySelectorAll('.service-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          const services = [...(masterData.services || [])];
          services.splice(idx, 1);
          masterData = { ...masterData, services };
          saveServices(services);
          renderServices();
        });
      });

      // Add service
      document.getElementById('add-service-btn')?.addEventListener('click', () => {
        const services = [...(masterData.services || [])];
        services.push({ name: 'Новая услуга', desc: 'Описание', price: 'Уточняйте' });
        masterData = { ...masterData, services };
        saveServices(services);
        renderServices();
      });
    }

    renderServices();
  }

  initServicesEdit();
}

/* ── Init ─── */
(async () => {
  const data = await loadMaster();
  if (!data) {
    document.getElementById('page-loading').innerHTML =
      '<div style="text-align:center;padding:40px;"><p style="color:var(--muted);">Страница не найдена</p><a href="/" style="color:var(--gold);margin-top:16px;display:block;">← На главную</a></div>';
    return;
  }

  // Check if subscription expired (only for non-owners)
  const urlToken = new URLSearchParams(window.location.search).get('token');
  const isOwner = urlToken && data.editToken === urlToken;

  if (data.isExpired && !isOwner) {
    const phone = data.phone || '';
    document.getElementById('page-loading').innerHTML = `
      <div style="text-align:center;padding:80px 24px;max-width:480px;margin:0 auto;">
        <div style="font-size:2.5rem;margin-bottom:20px;">🌸</div>
        <h2 style="font-size:1.6rem;font-weight:400;color:#F5F0E8;margin-bottom:12px;">${data.name || 'Мастер'}</h2>
        <p style="color:#C9A96E;font-size:1rem;margin-bottom:8px;">${data.specialty || ''}</p>
        <div style="width:40px;height:1px;background:#C9A96E;margin:20px auto;"></div>
        <p style="color:#8a7a6a;font-style:italic;line-height:1.7;margin-bottom:28px;">
          Страница временно на обслуживании.<br/>
          Для записи свяжитесь с мастером напрямую.
        </p>
        ${phone ? `<a href="tel:${phone}" style="display:inline-block;padding:14px 32px;background:#C9A96E;color:#0a0a0a;border-radius:8px;text-decoration:none;font-size:1rem;letter-spacing:0.05em;">${phone}</a>` : ''}
        <div style="margin-top:32px;"><a href="/" style="color:#4a3a2a;font-size:0.8rem;">BeautyMaster.by</a></div>
      </div>`;
    return;
  }

  try {
    renderPage(data);
  } catch(err) {
    console.error('renderPage error:', err);
    document.getElementById('page-loading').style.display = 'none';
    document.getElementById('page-content').style.display = 'block';
  }
  await initOwnerMode();
})();
