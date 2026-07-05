/* ============================================================
   BEAUTYMASTER.BY — Dashboard JS
   ============================================================ */

const DAY_KEYS   = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180, 210, 240, 300, 360];
function formatDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return `${m} мин`;
  if (!m) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

const params = new URLSearchParams(window.location.search);
const slug   = params.get('slug');
const token  = params.get('token');

let master = null; // loaded from server, source of truth

const state = {
  services: [],
  schedule: DAY_KEYS.map((key, i) => ({ key, day: DAY_LABELS[i], enabled: i < 6, from: '10:00', to: '20:00' })),
  nextServiceId: 1,
};

function isValidPhone(v) {
  if (!v) return true; // optional fields
  if (!/^\+[\d\s\-()]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 11 && digits.length <= 12;
}

/* ── Block access without a valid personal link ─────────────── */
function showBlockedScreen(message) {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#0a0a0a;">
      <div style="text-align:center;max-width:420px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🔒</div>
        <h1 style="color:#F5F0E8;font-family:'Cormorant Garant',serif;font-size:1.6rem;margin-bottom:12px;">${message}</h1>
        <p style="color:#8a7a6a;font-size:0.9rem;line-height:1.6;">
          Кабинет мастера открывается только по персональной ссылке, которую вы получили в Telegram после регистрации.
        </p>
        <a href="../index.html" style="display:inline-block;margin-top:24px;color:#C9A96E;font-size:0.9rem;">← На главную</a>
      </div>
    </div>`;
}

/* ── Load master data from server ────────────────────────────── */
async function loadMasterData() {
  const verifyRes = await fetch(`/api/verify-token?slug=${slug}&token=${token}`).then(r => r.json()).catch(() => ({ valid: false }));
  if (!verifyRes.valid) return null;
  const res = await fetch(`/api/get-master?slug=${slug}`);
  if (!res.ok) return null;
  return res.json();
}

function scheduleFromMaster(m) {
  return DAY_KEYS.map((key, i) => {
    const d = m.schedule?.[key];
    return { key, day: DAY_LABELS[i], enabled: d?.enabled ?? false, from: d?.from || '10:00', to: d?.to || '20:00' };
  });
}

function servicesFromMaster(m) {
  return (m.services || []).map((s, i) => ({ id: i + 1, name: s.name || '', price: s.price || '', desc: s.desc || '', duration: s.duration || 60 }));
}

function populateForm(m) {
  document.getElementById('sb-avatar').innerHTML = m.photo ? `<img src="${m.photo}" alt="Фото" />` : initials(m.name);
  document.getElementById('sb-name').textContent = m.name || 'Мастер';
  document.getElementById('sb-spec').textContent = m.specialty ? `💅 ${m.specialty}` : '';

  const avPreview = document.getElementById('avatar-preview');
  avPreview.innerHTML = m.photo ? `<img src="${m.photo}" alt="Фото профиля" />` : initials(m.name);

  document.getElementById('p-name').value = m.name || '';
  if (m.specialty) {
    const sel = document.getElementById('p-direction');
    for (const opt of sel.options) if (opt.value === m.specialty) { sel.value = m.specialty; break; }
  }
  document.getElementById('p-location').value = m.city || '';
  document.getElementById('p-phone').value = m.phone || '';
  document.getElementById('p-instagram').value = m.instagram || '';
  document.getElementById('p-tiktok').value = m.tiktok || '';
  document.getElementById('p-bio').value = m.bio || '';
  document.getElementById('bio-count').textContent = (m.bio || '').length;
  document.getElementById('p-tagline').value = m.tagline || '';

  document.getElementById('master-link').value = `beautymaster-by.vercel.app/master/${m.slug || slug}`;

  state.services = servicesFromMaster(m);
  state.nextServiceId = state.services.length + 1;
  renderServices();

  state.schedule = scheduleFromMaster(m);
  renderSchedule();

  const grid = document.getElementById('portfolio-grid-editor');
  grid.innerHTML = '';
  (m.photos || []).forEach(url => addThumb(url, '', true));
}

function initials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';
}

/* ── Sidebar nav ───────────────────────────────────────────── */
document.querySelectorAll('.snav-item[data-section]').forEach(item => {
  item.addEventListener('click', (e) => {
    const section = item.dataset.section;
    if (section === 'preview') return; // opens new tab via href
    e.preventDefault();

    document.querySelectorAll('.snav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.body.style.overflow = '';

    // Load stats when switching to stats section
    if (section === 'stats') loadStats();
  });
});

/* ── Statistics ────────────────────────────────────────────── */
async function loadStats() {
  if (!slug) return;
  try {
    const res  = await fetch(`/api/get-master?slug=${slug}`);
    const data = await res.json();
    const bookings = data.bookings || [];

    document.getElementById('stat-total').textContent = bookings.length || '0';

    const now   = new Date();
    const month = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('stat-month').textContent = month || '0';

    // Top service
    const serviceCounts = {};
    bookings.forEach(b => { if (b.service && b.service !== '—') serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1; });
    const topService = Object.entries(serviceCounts).sort((a,b) => b[1]-a[1])[0];
    document.getElementById('stat-top-service').textContent = topService ? topService[0] : '—';

    // Bookings list
    const list = document.getElementById('stat-bookings-list');
    if (bookings.length === 0) {
      list.innerHTML = '<div class="stat-empty">Записей пока нет — поделитесь ссылкой на вашу страницу с клиентами!</div>';
    } else {
      list.innerHTML = bookings.slice(-10).reverse().map(b => `
        <div class="stat-booking-row">
          <span class="stat-booking-name">${b.name}</span>
          <span class="stat-booking-service">${b.service !== '—' ? b.service : b.type === 'callback' ? 'Звонок' : 'Запись'}</span>
          <span class="stat-booking-date">${b.date !== '—' ? b.date : new Date(b.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>
      `).join('');
    }
  } catch { /* silent */ }
}

/* ── Mobile burger ─────────────────────────────────────────── */
const mobileBurger = document.getElementById('mobile-burger');
const sidebar = document.getElementById('sidebar');
mobileBurger?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  document.body.style.overflow = open ? 'hidden' : '';
});

/* ── Toast ─────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ` toast--${type}` : '');
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

/* ── Upload a photo to the server ─────────────────────────────── */
async function uploadPhoto(file, photoType) {
  const maxMb = photoType === 'avatar' ? 5 : 10;
  if (!file.type.startsWith('image/')) { showToast('Можно загружать только изображения', 'error'); return null; }
  if (file.size > maxMb * 1024 * 1024) { showToast(`Файл слишком большой (максимум ${maxMb} МБ)`, 'error'); return null; }

  showToast(photoType === 'avatar' ? 'Загружаем аватарку...' : 'Загружаем фото...');
  try {
    const res = await fetch('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': file.type, 'x-slug': slug, 'x-token': token, 'x-photo-type': photoType },
      body: file
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Ошибка загрузки');
    showToast(photoType === 'avatar' ? '✓ Аватарка обновлена' : '✓ Фото добавлено', 'success');
    return data.url;
  } catch (err) {
    showToast('Ошибка: ' + err.message, 'error');
    return null;
  }
}

/* ── Avatar upload ─────────────────────────────────────────── */
(function initAvatarUpload() {
  const area    = document.getElementById('avatar-upload-area');
  const input   = document.getElementById('avatar-input');
  const preview = document.getElementById('avatar-preview');
  const sbAv    = document.getElementById('sb-avatar');

  area?.addEventListener('click', () => input.click());
  input?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadPhoto(file, 'avatar');
    if (url) {
      preview.innerHTML = `<img src="${url}" alt="Фото профиля" />`;
      sbAv.innerHTML    = `<img src="${url}" alt="Фото" />`;
      if (master) master.photo = url;
    }
    input.value = '';
  });
})();

/* ── Bio char count ────────────────────────────────────────── */
(function initBioCount() {
  const ta = document.getElementById('p-bio');
  const ct = document.getElementById('bio-count');
  if (!ta || !ct) return;
  const update = () => {
    ct.textContent = ta.value.length;
    ct.style.color = ta.value.length > 380 ? '#E74C3C' : '';
  };
  ta.addEventListener('input', update);
  update();
})();

/* ── AI Bio helper (demo only — not a real generator) ────────── */
(function initAI() {
  const aiBtn      = document.getElementById('ai-bio-btn');
  const aiPanel    = document.getElementById('ai-panel');
  const generateBtn = document.getElementById('ai-generate-btn');
  const resultEl   = document.getElementById('ai-result');
  const resultText = document.getElementById('ai-result-text');
  const acceptBtn  = document.getElementById('ai-accept-btn');
  const retryBtn   = document.getElementById('ai-retry-btn');
  const bioField   = document.getElementById('p-bio');
  const promptField = document.getElementById('ai-prompt');

  aiBtn?.addEventListener('click', () => {
    const open = aiPanel.style.display === 'none';
    aiPanel.style.display = open ? 'block' : 'none';
  });

  const demoResponses = [
    'Более 5 лет я превращаю обычный маникюр в маленький шедевр. Каждая клиентка для меня — это отдельный проект, и я подхожу к нему с полной отдачей. Работаю только с проверенными премиальными материалами — потому что вы заслуживаете лучшего. Ко мне приходят один раз, а возвращаются снова и снова.',
    'Мои ногти — это не просто покрытие, это акцент вашего образа. За 5 лет практики я поняла: клиентки хотят не просто сделать ногти, они хотят уйти с хорошим настроением и уверенностью в себе. Именно это я и дарю каждой. Записывайтесь — и убедитесь сами.',
    'Я мастер маникюра с душой дизайнера. Люблю необычные идеи, следую трендам, но всегда ставлю ваши пожелания на первое место. Результат? Ногти, которыми хочется хвастаться. Жду вас!',
  ];
  let responseIndex = 0;

  generateBtn?.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> Генерирую...';

    setTimeout(() => {
      const text = demoResponses[responseIndex % demoResponses.length];
      resultText.textContent = text;
      resultEl.style.display = 'block';
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Сгенерировать';
    }, 1400);
  });

  acceptBtn?.addEventListener('click', () => {
    if (bioField) bioField.value = resultText.textContent;
    document.getElementById('bio-count').textContent = bioField.value.length;
    aiPanel.style.display = 'none';
    resultEl.style.display = 'none';
    showToast('✓ Текст добавлен в профиль', 'success');
  });

  retryBtn?.addEventListener('click', () => {
    responseIndex++;
    resultEl.style.display = 'none';
    generateBtn.click();
  });
})();

/* ── Services Editor ───────────────────────────────────────── */
function renderServices() {
  const editor = document.getElementById('services-editor');
  if (!editor) return;
  editor.innerHTML = '';
  state.services.forEach((svc) => {
    const row = document.createElement('div');
    row.className = 'service-edit-row';
    row.dataset.id = svc.id;
    row.innerHTML = `
      <input type="text" class="form-input service-edit-name" value="${svc.name}" placeholder="Название услуги" />
      <input type="text" class="form-input service-edit-price" value="${svc.price}" placeholder="Цена (напр. от 30 BYN)" />
      <select class="form-input service-edit-duration" title="Сколько времени занимает услуга">
        ${DURATION_OPTIONS.map(min => `<option value="${min}" ${svc.duration === min ? 'selected' : ''}>${formatDuration(min)}</option>`).join('')}
      </select>
      <button class="service-delete-btn" title="Удалить">✕</button>
    `;
    row.querySelector('.service-delete-btn').addEventListener('click', () => {
      state.services = state.services.filter(s => s.id !== svc.id);
      renderServices();
    });
    row.querySelector('.service-edit-name').addEventListener('input', (e) => {
      const s = state.services.find(s => s.id === svc.id);
      if (s) s.name = e.target.value;
    });
    row.querySelector('.service-edit-price').addEventListener('input', (e) => {
      const s = state.services.find(s => s.id === svc.id);
      if (s) s.price = e.target.value;
    });
    row.querySelector('.service-edit-duration').addEventListener('change', (e) => {
      const s = state.services.find(s => s.id === svc.id);
      if (s) s.duration = parseInt(e.target.value, 10);
    });
    editor.appendChild(row);
  });
}

document.getElementById('add-service-btn')?.addEventListener('click', () => {
  state.services.push({ id: state.nextServiceId++, name: '', price: '', desc: '', duration: 60 });
  renderServices();
  const rows = document.querySelectorAll('.service-edit-row');
  const last = rows[rows.length - 1];
  last?.querySelector('.service-edit-name')?.focus();
});

/* ── Schedule Editor ───────────────────────────────────────── */
function renderSchedule() {
  const container = document.getElementById('schedule-days');
  if (!container) return;
  container.innerHTML = '';

  state.schedule.forEach((day, idx) => {
    const row = document.createElement('div');
    row.className = 'schedule-day-row';
    row.innerHTML = `
      <label class="day-toggle">
        <div class="day-check ${day.enabled ? 'checked' : ''}" data-idx="${idx}"></div>
        <span class="day-name">${day.day}</span>
      </label>
      ${day.enabled
        ? `<input type="time" class="day-time-input" value="${day.from}" data-idx="${idx}" data-field="from" />
           <input type="time" class="day-time-input" value="${day.to}"   data-idx="${idx}" data-field="to" />`
        : `<span class="day-off-label">Выходной</span>`
      }
      <div></div>
    `;

    row.querySelector('.day-check')?.addEventListener('click', () => {
      state.schedule[idx].enabled = !state.schedule[idx].enabled;
      renderSchedule();
    });

    row.querySelectorAll('.day-time-input').forEach(input => {
      input.addEventListener('change', (e) => {
        state.schedule[idx][e.target.dataset.field] = e.target.value;
      });
      input.disabled = !day.enabled;
    });

    container.appendChild(row);
  });
}

/* ── Portfolio upload ──────────────────────────────────────── */
(function initPortfolio() {
  const uploadArea = document.getElementById('portfolio-upload-area');
  const input      = document.getElementById('portfolio-input');
  const grid       = document.getElementById('portfolio-grid-editor');

  uploadArea?.addEventListener('click', () => input.click());

  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  input?.addEventListener('change', (e) => handleFiles(Array.from(e.target.files)));

  async function handleFiles(files) {
    if ((grid.children.length + files.length) > 20) {
      showToast('Максимум 20 фото в портфолио', 'error');
    }
    for (const file of files.filter(f => f.type.startsWith('image/'))) {
      const url = await uploadPhoto(file, 'portfolio');
      if (url) {
        if (master) { master.photos = master.photos || []; master.photos.push(url); }
        addThumb(url, '');
      }
    }
  }
})();

function addThumb(src, caption = '') {
  const grid = document.getElementById('portfolio-grid-editor');
  const thumb = document.createElement('div');
  thumb.className = 'portfolio-thumb';
  thumb.innerHTML = `
    <img src="${src}" alt="${caption}" />
    <div class="thumb-overlay">
      <button class="thumb-edit-btn" title="Подпись">✎</button>
      <button class="thumb-delete-btn" title="Удалить">✕</button>
    </div>
    <div class="thumb-caption-wrap">
      <input type="text" class="thumb-caption" placeholder="Подпись (необязательно)" value="${caption}" />
    </div>
  `;
  thumb.querySelector('.thumb-delete-btn').addEventListener('click', () => {
    if (master?.photos) master.photos = master.photos.filter(u => u !== src);
    thumb.remove();
  });
  grid?.appendChild(thumb);
}

/* ── Save to server ────────────────────────────────────────── */
async function persist(partial) {
  if (!slug || !token) { showToast('Нет доступа к сохранению', 'error'); return false; }
  try {
    const res = await fetch('/api/save-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...partial, slug, token })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Ошибка сохранения');
    return true;
  } catch (err) {
    showToast('Ошибка: ' + err.message, 'error');
    return false;
  }
}

window.saveSection = async function(section) {
  if (section === 'profile') {
    const name  = document.getElementById('p-name')?.value.trim();
    const phone = document.getElementById('p-phone')?.value.trim();
    if (!name || name.length < 2) { showToast('Введите имя мастера', 'error'); return; }
    if (phone && !isValidPhone(phone)) { showToast('Неверный формат телефона. Пример: +375291234567', 'error'); return; }

    const dir = document.getElementById('p-direction')?.value;
    const ok = await persist({
      name,
      specialty: dir,
      city: document.getElementById('p-location')?.value.trim(),
      phone,
      instagram: document.getElementById('p-instagram')?.value.trim(),
      tiktok: document.getElementById('p-tiktok')?.value.trim(),
      bio: document.getElementById('p-bio')?.value.trim(),
      tagline: document.getElementById('p-tagline')?.value.trim(),
    });
    if (!ok) return;

    document.getElementById('sb-name').textContent = name;
    document.getElementById('sb-spec').textContent = dir ? `💅 ${dir}` : '';
    if (master) Object.assign(master, { name, specialty: dir });

  } else if (section === 'services') {
    for (const s of state.services) {
      if (!s.name.trim()) { showToast('У каждой услуги должно быть название', 'error'); return; }
      if (!/\d/.test(s.price)) { showToast(`Цена услуги «${s.name}» должна содержать хотя бы одну цифру`, 'error'); return; }
    }
    const ok = await persist({ services: state.services.map(s => ({ name: s.name.trim(), price: s.price.trim(), desc: s.desc || '', duration: s.duration || 60 })) });
    if (!ok) return;

  } else if (section === 'schedule') {
    const schedule = {};
    state.schedule.forEach(d => { schedule[d.key] = { enabled: d.enabled, from: d.from, to: d.to }; });
    const ok = await persist({ schedule });
    if (!ok) return;

  } else if (section === 'portfolio') {
    // Photos are already uploaded and saved individually as they're added; nothing extra to persist.
  }

  const labels = {
    profile:   '✓ Профиль сохранён',
    services:  '✓ Услуги сохранены',
    schedule:  '✓ Расписание сохранено',
    portfolio: '✓ Портфолио сохранено',
  };
  showToast(labels[section] || '✓ Сохранено', 'success');
};

document.getElementById('save-all-btn')?.addEventListener('click', async () => {
  await window.saveSection('profile');
  await window.saveSection('services');
  await window.saveSection('schedule');
});

/* ── Link copy ─────────────────────────────────────────────── */
document.getElementById('link-copy-btn')?.addEventListener('click', function() {
  const val = document.getElementById('master-link')?.value || '';
  navigator.clipboard.writeText('https://' + val).catch(() => {});
  this.textContent = '✓ Скопировано';
  this.classList.add('copied');
  setTimeout(() => {
    this.textContent = 'Копировать';
    this.classList.remove('copied');
  }, 2000);
});

/* ── Init ──────────────────────────────────────────────────── */
(async function init() {
  if (!slug || !token) {
    showBlockedScreen('Личная ссылка не найдена');
    return;
  }
  const data = await loadMasterData();
  if (!data) {
    showBlockedScreen('Не удалось открыть кабинет');
    return;
  }
  master = data;
  populateForm(master);
})();
