/* ============================================================
   BEAUTYMASTER.BY — Dashboard JS
   ============================================================ */

/* ── State ─────────────────────────────────────────────────── */
const state = {
  services: [
    { id: 1, name: 'Маникюр классический',  price: 'от 30 BYN' },
    { id: 2, name: 'Маникюр аппаратный',    price: 'от 40 BYN' },
    { id: 3, name: 'Педикюр классический',  price: 'от 45 BYN' },
    { id: 4, name: 'Покрытие гель-лак',     price: 'от 25 BYN' },
    { id: 5, name: 'Наращивание ногтей',    price: 'от 80 BYN' },
    { id: 6, name: 'Снятие покрытия',       price: '10 BYN' },
    { id: 7, name: 'Дизайн (1 ноготь)',     price: 'от 3 BYN' },
  ],
  schedule: [
    { day: 'Понедельник', enabled: true,  from: '10:00', to: '20:00' },
    { day: 'Вторник',     enabled: true,  from: '10:00', to: '20:00' },
    { day: 'Среда',       enabled: true,  from: '10:00', to: '20:00' },
    { day: 'Четверг',     enabled: true,  from: '10:00', to: '20:00' },
    { day: 'Пятница',     enabled: true,  from: '10:00', to: '20:00' },
    { day: 'Суббота',     enabled: true,  from: '10:00', to: '18:00' },
    { day: 'Воскресенье', enabled: false, from: '10:00', to: '18:00' },
  ],
  nextServiceId: 8,
};

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
  });
});

/* ── Mobile burger ─────────────────────────────────────────── */
const mobileBurger = document.getElementById('mobile-burger');
const sidebar = document.getElementById('sidebar');
mobileBurger?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  document.body.style.overflow = open ? 'hidden' : '';
});

/* ── Avatar upload ─────────────────────────────────────────── */
(function initAvatarUpload() {
  const area    = document.getElementById('avatar-upload-area');
  const input   = document.getElementById('avatar-input');
  const preview = document.getElementById('avatar-preview');
  const sbAv    = document.getElementById('sb-avatar');

  area?.addEventListener('click', () => input.click());
  input?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      preview.innerHTML = `<img src="${src}" alt="Фото профиля" />`;
      sbAv.innerHTML    = `<img src="${src}" alt="Фото" />`;
    };
    reader.readAsDataURL(file);
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

/* ── AI Bio helper ─────────────────────────────────────────── */
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

  // Demo AI responses (in real app — calls Gemini API)
  const demoResponses = [
    'Более 5 лет я превращаю обычный маникюр в маленький шедевр. Каждая клиентка для меня — это отдельный проект, и я подхожу к нему с полной отдачей. Работаю только с проверенными премиальными материалами — потому что вы заслуживаете лучшего. Ко мне приходят один раз, а возвращаются снова и снова.',
    'Мои ногти — это не просто покрытие, это акцент вашего образа. За 5 лет практики я поняла: клиентки хотят не просто сделать ногти, они хотят уйти с хорошим настроением и уверенностью в себе. Именно это я и дарю каждой. Записывайтесь — и убедитесь сами.',
    'Я мастер маникюра с душой дизайнера. Люблю необычные идеи, следую трендам, но всегда ставлю ваши пожелания на первое место. Результат? Ногти, которыми хочется хвастаться. Жду вас!',
  ];
  let responseIndex = 0;

  generateBtn?.addEventListener('click', () => {
    const prompt = promptField.value.trim();
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
  state.services.forEach((svc, idx) => {
    const row = document.createElement('div');
    row.className = 'service-edit-row';
    row.dataset.id = svc.id;
    row.innerHTML = `
      <input type="text" class="form-input service-edit-name" value="${svc.name}" placeholder="Название услуги" />
      <input type="text" class="form-input service-edit-price" value="${svc.price}" placeholder="Цена (напр. от 30 BYN)" />
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
    editor.appendChild(row);
  });
}

document.getElementById('add-service-btn')?.addEventListener('click', () => {
  state.services.push({ id: state.nextServiceId++, name: '', price: '' });
  renderServices();
  const rows = document.querySelectorAll('.service-edit-row');
  const last = rows[rows.length - 1];
  last?.querySelector('.service-edit-name')?.focus();
});

renderServices();

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

    // Toggle checkbox
    row.querySelector('.day-check')?.addEventListener('click', () => {
      state.schedule[idx].enabled = !state.schedule[idx].enabled;
      renderSchedule();
    });

    // Time inputs
    row.querySelectorAll('.day-time-input').forEach(input => {
      input.addEventListener('change', (e) => {
        state.schedule[idx][e.target.dataset.field] = e.target.value;
      });
      input.disabled = !day.enabled;
    });

    container.appendChild(row);
  });
}

renderSchedule();

/* ── Portfolio upload ──────────────────────────────────────── */
(function initPortfolio() {
  const uploadArea = document.getElementById('portfolio-upload-area');
  const input      = document.getElementById('portfolio-input');
  const grid       = document.getElementById('portfolio-grid-editor');

  uploadArea?.addEventListener('click', () => input.click());

  // Drag & drop
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

  function handleFiles(files) {
    files.filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => addThumb(ev.target.result, file.name.replace(/\.[^.]+$/, ''));
      reader.readAsDataURL(file);
    });
  }

  function addThumb(src, caption = '') {
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
    thumb.querySelector('.thumb-delete-btn').addEventListener('click', () => thumb.remove());
    grid?.appendChild(thumb);
  }

  // Existing delete buttons
  grid?.querySelectorAll('.thumb-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.portfolio-thumb').remove());
  });
})();

/* ── Save buttons ──────────────────────────────────────────── */
window.saveSection = function(section) {
  const labels = {
    profile:   '✓ Профиль сохранён',
    services:  '✓ Услуги сохранены',
    schedule:  '✓ Расписание сохранено',
    portfolio: '✓ Портфолио сохранено',
  };
  showToast(labels[section] || '✓ Сохранено', 'success');

  // Update sidebar name/spec from profile inputs
  if (section === 'profile') {
    const name = document.getElementById('p-name')?.value;
    const dir  = document.getElementById('p-direction')?.value;
    if (name) document.getElementById('sb-name').textContent = name;
    if (dir)  document.getElementById('sb-spec').textContent = dir;
    // Initials
    if (name) {
      const parts = name.trim().split(' ');
      const initials = parts.length >= 2
        ? parts[0][0] + parts[1][0]
        : parts[0].slice(0, 2);
      const av = document.getElementById('avatar-preview');
      if (av && !av.querySelector('img')) av.textContent = initials.toUpperCase();
      const sbAv = document.getElementById('sb-avatar');
      if (sbAv && !sbAv.querySelector('img')) sbAv.textContent = initials.toUpperCase();
    }
  }
};

document.getElementById('save-all-btn')?.addEventListener('click', () => {
  showToast('✓ Все изменения сохранены', 'success');
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
