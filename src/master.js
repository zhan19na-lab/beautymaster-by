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
  document.getElementById('booking-title').textContent = `Записаться к ${d.name?.split(' ')[0] || 'мастеру'}`;
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
  if (d.phone) {
    socials.innerHTML += `<a href="https://wa.me/${d.phone.replace(/[^0-9]/g,'')}" class="social-btn social-btn--wa" target="_blank" aria-label="WhatsApp">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.29-.14-1.72-.85-1.99-.95-.27-.1-.47-.14-.67.14-.2.28-.78.95-.96 1.14-.18.2-.35.22-.64.07-.29-.14-1.23-.45-2.34-1.45-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.59.13-.12.29-.32.44-.48.15-.16.2-.27.29-.45.1-.18.05-.34-.02-.48-.07-.14-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.34-.27.27-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.19 5.07 4.47.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.08-.12-.27-.19-.57-.33z"/><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.34C8.5 21.51 10.22 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.67 0-3.22-.48-4.53-1.31l-.32-.19-3.02.79.81-2.96-.21-.34C3.49 14.97 3 13.54 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/></svg>
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
    document.getElementById('contact-wa-block').style.display = 'block';
    document.getElementById('contact-wa-link').href = `https://wa.me/${d.phone.replace(/[^0-9]/g,'')}`;
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

/* ── Booking form ─── */
function isValidPhone(v) { return /^[\+\d][\d\s\-\(\)]{6,}$/.test(v); }

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
    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking', name, phone,
        service: window.__bookingService || '—',
        date: window.__bookingDate || '—',
        time: window.__bookingTime || '—',
        masterUsername: masterData?.tgUsername
      })
    }).catch(() => {});

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
    btn.disabled = true; btn.textContent = 'Отправляем...';
    await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'order', name, phone, message, masterUsername: masterData?.tgUsername }) }).catch(() => {});
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
    btn.disabled = true; btn.textContent = 'Отправляем...';
    await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'callback', name, phone, masterUsername: masterData?.tgUsername }) }).catch(() => {});
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
}

/* ── Init ─── */
(async () => {
  const data = await loadMaster();
  if (!data) {
    document.getElementById('page-loading').innerHTML =
      '<div style="text-align:center;padding:40px;"><p style="color:var(--muted);">Страница не найдена</p><a href="/" style="color:var(--gold);margin-top:16px;display:block;">← На главную</a></div>';
    return;
  }
  renderPage(data);
  initOwnerMode();
})();
