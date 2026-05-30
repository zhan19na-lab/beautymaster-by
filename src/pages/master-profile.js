/* ============================================================
   BEAUTYMASTER.BY — Master Profile JS
   ============================================================ */

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── Inline editing (double-click to edit) ─────────────────── */
(function initInlineEdit() {
  const editables = [
    { sel: '.profile-name',    key: 'master-name',    hint: 'Введите имя мастера' },
    { sel: '.profile-bio',     key: 'master-bio',     hint: 'Введите описание' },
    { sel: '.profile-location',key: 'master-location',hint: 'Город и адрес' },
  ];

  editables.forEach(({ sel, key, hint }) => {
    const el = document.querySelector(sel);
    if (!el) return;

    // Load saved value
    const saved = localStorage.getItem(key);
    if (saved) el.textContent = saved;

    el.title = 'Дважды кликни, чтобы изменить';
    el.style.cursor = 'pointer';
    el.classList.add('editable-field');

    el.addEventListener('dblclick', () => {
      const original = el.textContent;
      const isMultiline = sel === '.profile-bio';

      if (isMultiline) {
        const ta = document.createElement('textarea');
        ta.className = 'inline-edit-textarea';
        ta.value = original;
        ta.rows = 4;
        el.replaceWith(ta);
        ta.focus();
        ta.select();
        const save = () => {
          const val = ta.value.trim() || original;
          el.textContent = val;
          localStorage.setItem(key, val);
          ta.replaceWith(el);
        };
        ta.addEventListener('blur', save);
        ta.addEventListener('keydown', e => { if (e.key === 'Escape') { ta.replaceWith(el); } });
      } else {
        const inp = document.createElement('input');
        inp.className = 'inline-edit-input';
        inp.value = original;
        inp.placeholder = hint;
        el.replaceWith(inp);
        inp.focus();
        inp.select();
        const save = () => {
          const val = inp.value.trim() || original;
          el.textContent = val;
          localStorage.setItem(key, val);
          inp.replaceWith(el);
        };
        inp.addEventListener('blur', save);
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') inp.blur();
          if (e.key === 'Escape') { inp.replaceWith(el); }
        });
      }
    });
  });

  // Service prices — inline edit
  document.querySelectorAll('.service-price').forEach(el => {
    el.title = 'Дважды кликни, чтобы изменить цену';
    el.style.cursor = 'pointer';
    el.addEventListener('dblclick', () => {
      const original = el.textContent;
      const inp = document.createElement('input');
      inp.className = 'inline-edit-price';
      inp.value = original;
      inp.style.cssText = `width:100px;background:transparent;border:1px solid var(--gold);color:var(--gold);font-size:inherit;padding:2px 6px;font-family:inherit;outline:none;`;
      el.replaceWith(inp);
      inp.focus(); inp.select();
      const save = () => {
        el.textContent = inp.value.trim() || original;
        inp.replaceWith(el);
        showEditToast();
      };
      inp.addEventListener('blur', save);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') inp.replaceWith(el); });
    });
  });

  // Service names
  document.querySelectorAll('.service-name').forEach(el => {
    el.title = 'Дважды кликни, чтобы изменить';
    el.style.cursor = 'pointer';
    el.addEventListener('dblclick', () => {
      const original = el.textContent;
      const inp = document.createElement('input');
      inp.className = 'inline-edit-input';
      inp.value = original;
      inp.style.cssText = `background:transparent;border:none;border-bottom:1px solid var(--gold);color:var(--cream);font-size:inherit;padding:2px 0;font-family:inherit;outline:none;width:100%;`;
      el.replaceWith(inp);
      inp.focus(); inp.select();
      const save = () => { el.textContent = inp.value.trim() || original; inp.replaceWith(el); showEditToast(); };
      inp.addEventListener('blur', save);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') inp.replaceWith(el); });
    });
  });

  function showEditToast() {
    const t = document.createElement('div');
    t.textContent = '✓ Изменение сохранено';
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#141414;border:1px solid var(--gold-border);color:#81C784;font-size:0.82rem;padding:10px 24px;z-index:999;animation:fadeIn 0.3s;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  // Add edit hint banner
  const hint = document.createElement('div');
  hint.className = 'edit-hint-bar';
  hint.innerHTML = '✎ &nbsp;Дважды кликни на имя, описание или цену — чтобы изменить прямо здесь';
  document.querySelector('.pnav')?.after(hint);
})();

/* ── Smooth scroll ─────────────────────────────────────────── */
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

/* ── Service row → pre-fill booking ───────────────────────── */
document.querySelectorAll('.service-book-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const row = btn.closest('.service-row');
    const name = row?.querySelector('.service-name')?.textContent;
    const price = row?.querySelector('.service-price')?.textContent;
    if (name) {
      const radios = document.querySelectorAll('[name="service"]');
      radios.forEach(r => {
        if (r.value.startsWith(name)) r.checked = true;
      });
    }
    const target = document.getElementById('booking');
    if (target) {
      const navH = document.querySelector('.pnav')?.offsetHeight || 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 20, behavior: 'smooth' });
    }
  });
});

/* ── Calendar ──────────────────────────────────────────────── */
(function initCalendar() {
  const wrap = document.getElementById('calendar-wrap');
  if (!wrap) return;

  const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

  let now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let selectedDate = null;

  function render() {
    wrap.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <button class="cal-nav-btn" id="cal-prev">‹</button>
      <span class="cal-month-label">${MONTHS_RU[viewMonth]} ${viewYear}</span>
      <button class="cal-nav-btn" id="cal-next">›</button>
    `;
    wrap.appendChild(header);

    const weekdays = document.createElement('div');
    weekdays.className = 'cal-weekdays';
    DAYS_RU.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-weekday';
      el.textContent = d;
      weekdays.appendChild(el);
    });
    wrap.appendChild(weekdays);

    const daysGrid = document.createElement('div');
    daysGrid.className = 'cal-days';

    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1; // Mon = 0

    for (let i = 0; i < startDow; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day cal-day--empty';
      daysGrid.appendChild(empty);
    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      dayEl.textContent = d;

      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast = thisDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isToday = `${viewYear}-${viewMonth}-${d}` === todayStr;
      const isSel = selectedDate && selectedDate.d === d && selectedDate.m === viewMonth && selectedDate.y === viewYear;

      if (isPast) dayEl.classList.add('cal-day--past');
      else if (isToday) dayEl.classList.add('cal-day--today');
      if (isSel) dayEl.classList.add('cal-day--selected');

      if (!isPast) {
        dayEl.addEventListener('click', () => {
          selectedDate = { d, m: viewMonth, y: viewYear };
          window.__bookingDate = `${d} ${MONTHS_RU[viewMonth].toLowerCase()} ${viewYear}`;
          render();
        });
      }
      daysGrid.appendChild(dayEl);
    }

    wrap.appendChild(daysGrid);

    document.getElementById('cal-prev')?.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });
  }

  render();
})();

/* ── Time slots ────────────────────────────────────────────── */
document.querySelectorAll('.time-slot:not(.time-slot--booked)').forEach(slot => {
  slot.addEventListener('click', () => {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    slot.classList.add('selected');
    window.__bookingTime = slot.dataset.time;
  });
});

/* ── Validation helpers ────────────────────────────────────── */
function showBookingError(id, msg) {
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
  const clear = () => { el.classList.remove('input-error'); hint.textContent = ''; el.removeEventListener('input', clear); };
  el.addEventListener('input', clear);
}

function isValidPhone(val) {
  return /^[\+\d][\d\s\-\(\)]{6,}$/.test(val);
}

/* ── Multi-step booking ────────────────────────────────────── */
window.bookingNext = function (fromStep) {
  if (fromStep === 1) {
    const checked = document.querySelector('[name="service"]:checked');
    if (!checked) {
      shakeStep(1);
      const hint = document.querySelector('#bstep-1 .bstep-hint') || (() => {
        const p = document.createElement('p');
        p.className = 'bstep-hint field-error';
        p.style.textAlign = 'center';
        p.style.marginTop = '12px';
        document.querySelector('#bstep-1 .service-radio-grid').after(p);
        return p;
      })();
      hint.textContent = 'Пожалуйста, выберите услугу';
      return;
    }
    window.__bookingService = checked.value;
  }
  if (fromStep === 2) {
    if (!window.__bookingDate) {
      shakeStep(2);
      const hint = document.querySelector('#bstep-2 .bstep-hint') || (() => {
        const p = document.createElement('p');
        p.className = 'bstep-hint field-error';
        p.style.textAlign = 'center';
        p.style.marginTop = '12px';
        document.querySelector('#bstep-2 .calendar-wrap').after(p);
        return p;
      })();
      hint.textContent = 'Пожалуйста, выберите дату';
      return;
    }
  }
  if (fromStep === 3) {
    if (!window.__bookingTime) {
      shakeStep(3);
      const hint = document.querySelector('#bstep-3 .bstep-hint') || (() => {
        const p = document.createElement('p');
        p.className = 'bstep-hint field-error';
        p.style.textAlign = 'center';
        p.style.marginTop = '12px';
        document.querySelector('#bstep-3 .time-slots').after(p);
        return p;
      })();
      hint.textContent = 'Пожалуйста, выберите время';
      return;
    }
  }

  // Move to next step
  const current = document.getElementById(`bstep-${fromStep}`);
  const next    = document.getElementById(`bstep-${fromStep + 1}`);
  if (current) current.classList.remove('active');
  if (next)    next.classList.add('active');

  // Update step nav
  const navSteps = document.querySelectorAll('.bstep');
  navSteps.forEach(s => {
    const n = parseInt(s.dataset.step);
    if (n < fromStep + 1) s.classList.add('done');
    if (n === fromStep + 1) s.classList.add('active');
  });

  // Fill summary on step 4
  if (fromStep === 3) {
    const sum = document.getElementById('booking-summary');
    if (sum) {
      sum.innerHTML = `
        <strong style="color:var(--gold-light)">Ваша запись:</strong><br>
        Услуга: ${window.__bookingService || '—'}<br>
        Дата: ${window.__bookingDate || '—'}<br>
        Время: ${window.__bookingTime || '—'}
      `;
    }
  }
};

function shakeStep(step) {
  const el = document.getElementById(`bstep-${step}`);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
}

/* ── Booking form submit ───────────────────────────────────── */
const bookingForm = document.getElementById('booking-form');
const bookingSuccess = document.getElementById('booking-success');

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name  = document.getElementById('b-name')?.value.trim();
  const phone = document.getElementById('b-phone')?.value.trim();

  let valid = true;
  if (!name || name.length < 2) {
    showBookingError('b-name', 'Введите ваше имя (минимум 2 символа)');
    valid = false;
  }
  if (!phone) {
    showBookingError('b-phone', 'Введите номер телефона');
    valid = false;
  } else if (!isValidPhone(phone)) {
    showBookingError('b-phone', 'Неверный формат. Пример: +375291234567');
    valid = false;
  }
  if (!valid) return;

  const btn = bookingForm.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = 'Отправляем...';

  await fetch('/api/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'booking',
      name,
      phone,
      service: window.__bookingService || '—',
      date: window.__bookingDate || '—',
      time: window.__bookingTime || '—'
    })
  }).catch(() => {});

  document.querySelector('.booking-wrap').innerHTML = '';
  bookingSuccess.style.display = 'flex';
  document.querySelector('.booking-wrap').appendChild(bookingSuccess);
  bookingSuccess.style.display = 'flex';
});

document.querySelectorAll('.bform-input').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('input-error'));
});

/* ── Share modal ───────────────────────────────────────────── */
(function initShare() {
  const fab     = document.getElementById('share-fab');
  const overlay = document.getElementById('share-modal-overlay');
  const closeBtn = document.getElementById('share-modal-close');
  const copyBtn = document.getElementById('share-copy-btn');
  const urlInput = document.getElementById('share-url-input');

  fab?.addEventListener('click', () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  copyBtn?.addEventListener('click', () => {
    const text = urlInput?.value || window.location.href;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✓ Скопировано';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Скопировать';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      if (urlInput) {
        urlInput.select();
        document.execCommand('copy');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.remove('open');
  });
})();

/* ── Contact FAB + Modal ───────────────────────────────────── */
(function initContactModal() {
  const fab     = document.getElementById('contact-fab');
  const overlay = document.getElementById('contact-modal-overlay');
  const closeBtn = document.getElementById('contact-modal-close');

  fab?.addEventListener('click', () => overlay?.classList.add('open'));
  closeBtn?.addEventListener('click', () => overlay?.classList.remove('open'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.remove('open');
  });

  // Tabs
  document.querySelectorAll('.contact-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.contact-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.contact-tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`ctab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  function showCFormError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('input-error');
    let hint = el.parentElement.querySelector('.field-error');
    if (!hint) { hint = document.createElement('p'); hint.className = 'field-error'; el.parentElement.appendChild(hint); }
    hint.textContent = msg;
    const clear = () => { el.classList.remove('input-error'); hint.textContent = ''; el.removeEventListener('input', clear); };
    el.addEventListener('input', clear);
  }

  // Order form
  document.getElementById('contact-form-order')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('co-name').value.trim();
    const phone   = document.getElementById('co-phone').value.trim();
    const message = document.getElementById('co-message').value.trim();
    let valid = true;
    if (!name || name.length < 2) { showCFormError('co-name', 'Введите ваше имя'); valid = false; }
    if (!phone) { showCFormError('co-phone', 'Введите номер телефона'); valid = false; }
    else if (!isValidPhone(phone)) { showCFormError('co-phone', 'Неверный формат. Пример: +375291234567'); valid = false; }
    if (!message || message.length < 3) { showCFormError('co-message', 'Опишите что вы хотите'); valid = false; }
    if (!valid) return;
    const btn = e.target.querySelector('.cform-submit');
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'order', name, phone, message })
    }).catch(() => {});
    e.target.style.display = 'none';
    document.getElementById('corder-success').style.display = 'flex';
  });

  // Callback form
  document.getElementById('contact-form-callback')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('cc-name').value.trim();
    const phone = document.getElementById('cc-phone').value.trim();
    let valid = true;
    if (!name || name.length < 2) { showCFormError('cc-name', 'Введите ваше имя'); valid = false; }
    if (!phone) { showCFormError('cc-phone', 'Введите номер телефона'); valid = false; }
    else if (!isValidPhone(phone)) { showCFormError('cc-phone', 'Неверный формат. Пример: +375291234567'); valid = false; }
    if (!valid) return;
    const btn = e.target.querySelector('.cform-submit');
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'callback', name, phone })
    }).catch(() => {});
    e.target.style.display = 'none';
    document.getElementById('ccallback-success').style.display = 'flex';
  });

  document.querySelectorAll('.cform-input').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });
})();
