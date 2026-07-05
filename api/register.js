const SERVICES_BY_DIRECTION = {
  'Маникюр / Педикюр': [
    { name: 'Маникюр классический', desc: 'Обработка ногтей и кутикулы', price: 'от 25 BYN' },
    { name: 'Маникюр с гель-лаком', desc: 'Покрытие гель-лаком, долгосрочный результат', price: 'от 40 BYN' },
    { name: 'Наращивание ногтей', desc: 'Гель или акрил', price: 'от 70 BYN' },
    { name: 'Педикюр классический', desc: 'Обработка стоп и ногтей', price: 'от 35 BYN' },
    { name: 'Педикюр с покрытием', desc: 'Педикюр + гель-лак', price: 'от 50 BYN' },
  ],
  'Ресницы': [
    { name: 'Классическое наращивание', desc: '1 к 1, натуральный эффект', price: 'от 50 BYN' },
    { name: 'Объёмное наращивание', desc: '2D-6D, пышный объём', price: 'от 70 BYN' },
    { name: 'Голливудский объём', desc: 'Mega volume, максимальный эффект', price: 'от 90 BYN' },
    { name: 'Коррекция ресниц', desc: 'Заполнение выпавших пучков', price: 'от 35 BYN' },
    { name: 'Снятие наращенных ресниц', desc: 'Бережное снятие', price: 'от 15 BYN' },
  ],
  'Брови': [
    { name: 'Коррекция бровей', desc: 'Придание формы воском или пинцетом', price: 'от 15 BYN' },
    { name: 'Окрашивание бровей', desc: 'Краска или хна', price: 'от 20 BYN' },
    { name: 'Брови под ключ', desc: 'Коррекция + окрашивание', price: 'от 30 BYN' },
    { name: 'Ламинирование бровей', desc: 'Укладка и фиксация на 4-6 недель', price: 'от 45 BYN' },
    { name: 'Перманентный макияж бровей', desc: 'Долгосрочный результат', price: 'от 150 BYN' },
  ],
  'Волосы': [
    { name: 'Стрижка женская', desc: 'Модельная стрижка с укладкой', price: 'от 30 BYN' },
    { name: 'Стрижка мужская', desc: 'Классическая или модельная стрижка', price: 'от 30 BYN' },
    { name: 'Окрашивание волос', desc: 'Однотонное окрашивание', price: 'от 60 BYN' },
    { name: 'Мелирование / Балаяж', desc: 'Техника осветления прядей', price: 'от 80 BYN' },
    { name: 'Кератиновое выпрямление', desc: 'Разглаживание и восстановление', price: 'от 120 BYN' },
    { name: 'Укладка / Причёска', desc: 'Повседневная или праздничная', price: 'от 25 BYN' },
  ],
  'Косметология': [
    { name: 'Чистка лица', desc: 'Механическая или ультразвуковая', price: 'от 50 BYN' },
    { name: 'Пилинг', desc: 'Химический или ферментный', price: 'от 45 BYN' },
    { name: 'Уходовая процедура', desc: 'Увлажнение и питание кожи', price: 'от 40 BYN' },
    { name: 'Мезотерапия', desc: 'Инъекционное омоложение', price: 'от 80 BYN' },
    { name: 'Биоревитализация', desc: 'Глубокое увлажнение гиалуроновой кислотой', price: 'от 120 BYN' },
  ],
  'Визаж': [
    { name: 'Дневной макияж', desc: 'Лёгкий натуральный образ', price: 'от 30 BYN' },
    { name: 'Вечерний макияж', desc: 'Яркий выразительный образ', price: 'от 50 BYN' },
    { name: 'Свадебный макияж', desc: 'Стойкий макияж на весь день', price: 'от 80 BYN' },
    { name: 'Макияж для фотосессии', desc: 'С учётом освещения и камеры', price: 'от 60 BYN' },
    { name: 'Уроки макияжа', desc: 'Индивидуальный урок под ваш тип лица', price: 'от 50 BYN' },
  ],
  'Массаж / СПА': [
    { name: 'Классический массаж', desc: 'Расслабляющий массаж тела', price: 'от 40 BYN' },
    { name: 'Антицеллюлитный массаж', desc: 'Моделирование фигуры', price: 'от 50 BYN' },
    { name: 'Массаж лица', desc: 'Лифтинг и дренаж', price: 'от 35 BYN' },
    { name: 'СПА-программа', desc: 'Комплексный уход для тела', price: 'от 80 BYN' },
    { name: 'Обёртывание', desc: 'Детокс и подтяжка кожи', price: 'от 45 BYN' },
  ],
  'Тату / ПМ': [
    { name: 'Перманентный макияж губ', desc: 'Акварель или контур', price: 'от 150 BYN' },
    { name: 'Перманентный макияж бровей', desc: 'Волосковая техника или пудровые', price: 'от 150 BYN' },
    { name: 'Перманентный макияж век', desc: 'Межресничный контур или стрелка', price: 'от 120 BYN' },
    { name: 'Тату небольшое', desc: 'До 5 см', price: 'от 50 BYN' },
    { name: 'Тату среднее', desc: 'От 5 до 15 см', price: 'от 100 BYN' },
  ],
};

function getServices(direction) {
  for (const key of Object.keys(SERVICES_BY_DIRECTION)) {
    if (direction && direction.includes(key.split(' ')[0])) return SERVICES_BY_DIRECTION[key];
  }
  return SERVICES_BY_DIRECTION[direction] || [{ name: 'Услуга', desc: 'Описание', price: 'Уточняйте' }];
}

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let t = '';
  for (let i = 0; i < 32; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function toSlug(name) {
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  };
  return name.toLowerCase()
    .split('').map(c => map[c] ?? (c === ' ' ? '-' : c))
    .join('').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, direction, contact, tgUsername, isVip } = req.body || {};
  if (!name || !direction || !contact || !tgUsername) return res.status(400).json({ error: 'Missing fields' });

  // Server-side validation
  const phoneDigits = contact.replace(/\D/g, '');
  if (!contact.startsWith('+') || phoneDigits.length < 11 || phoneDigits.length > 12) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }
  const tgClean = tgUsername.startsWith('@') ? tgUsername : '@' + tgUsername;
  if (!/^@[a-zA-Z0-9_]{5,32}$/.test(tgClean)) {
    return res.status(400).json({ error: 'Invalid Telegram username' });
  }

  const nameFixed = name.charAt(0).toUpperCase() + name.slice(1);
  const slugRaw   = toSlug(nameFixed);
  const slug      = slugRaw || `master-${Date.now()}`;
  const editToken = generateToken();
  const pageUrl   = `https://beautymaster-by.vercel.app/master/${slug}`;
  const editUrl   = `https://beautymaster-by.vercel.app/master/${slug}?token=${editToken}`;
  const token   = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_CHAT_ID;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) return res.status(500).json({ error: 'Storage not configured' });

  // Create master page in Blob storage
  let saved = false;
  {
    const masterData = {
      slug, name: nameFixed, specialty: direction, phone: contact, editToken,
      tgUsername: tgUsername?.replace('@','') || '',
      city: '',
      bio: '',
      services: getServices(direction),
      schedule: {
        mon: { enabled: true,  from: '09:00', to: '19:00' },
        tue: { enabled: true,  from: '09:00', to: '19:00' },
        wed: { enabled: true,  from: '09:00', to: '19:00' },
        thu: { enabled: true,  from: '09:00', to: '19:00' },
        fri: { enabled: true,  from: '09:00', to: '19:00' },
        sat: { enabled: true,  from: '10:00', to: '17:00' },
        sun: { enabled: false }
      },
      bookedSlots: [],
      createdAt: new Date().toISOString()
    };

    const putRes = await fetch(`https://blob.vercel-storage.com/masters/${slug}.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${blobToken}`,
        'content-type': 'application/json',
        'x-add-random-suffix': '0',
        'x-vercel-blob-access': 'private'
      },
      body: JSON.stringify(masterData)
    }).catch(() => null);
    saved = !!putRes?.ok;
  }

  if (!saved) return res.status(500).json({ error: 'Failed to save master page' });

  // Notify admin
  if (token && adminId) {
    const tgInfo = tgUsername ? `\n📱 <b>Telegram:</b> @${tgUsername.replace('@','')}` : '';
    const vipHeader = isVip
      ? `🔴🔴🔴 <b>VIP — ГОРЯЧАЯ ЗАЯВКА СО СКИДКОЙ 50%!</b> 🔴🔴🔴\n\n`
      : `🌸 <b>Новая регистрация мастера!</b>\n\n`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: isVip
          ? `${vipHeader}👤 <b>Имя:</b> ${name}\n💅 <b>Направление:</b> ${direction}\n📞 <b>Контакт:</b> ${contact}${tgInfo}\n\n📋 <b>Анкета:</b> https://beautymaster-by.vercel.app/anketa?slug=${slug}\n🔗 <b>Страница:</b> ${pageUrl}`
          : `${vipHeader}👤 <b>Имя:</b> ${name}\n💅 <b>Направление:</b> ${direction}\n📞 <b>Контакт:</b> ${contact}${tgInfo}\n\n🔗 <b>Страница:</b> ${pageUrl}`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }).catch(() => {});
  }

  // Auto-reply to master if chat_id known
  if (token && tgUsername) {
    const clean = tgUsername.replace('@','').toUpperCase().replace(/[^A-Z0-9]/g,'_');
    const masterChatId = process.env[`MASTER_${clean}`];
    if (masterChatId) {
      const replyText = isVip
        ? `🌸 <b>${nameFixed}, ваша заявка принята!</b>\n\n<i>Спасибо за доверие — для меня это очень важно.</i>\n\n<i>Я лично свяжусь с вами в ближайшее время, и мы в тёплой беседе обсудим каждую деталь.</i>\n\n<i>Ваше приложение будет создано</i> <b>под ключ</b> <i>— красиво, профессионально и именно так, как вы мечтаете.</i>\n\n<i>До скорой встречи!</i> 🤍\n\n🌸 <b>Давайте создадим что-то по-настоящему ваше!</b>\n<i>Заполните короткую анкету — это займёт 3 минуты и поможет мне подготовиться:</i>\n\nhttps://beautymaster-by.vercel.app/anketa?slug=${slug}`
        : `✅ <b>Заявка получена, ${nameFixed}!</b>\n\n🎉 Ваша страница уже готова — настройте её прямо сейчас.\n\n🔗 <b>Ваша личная ссылка для редактирования:</b>\n${editUrl}\n\n⚠️ Эту ссылку никому не передавайте — по ней можно изменять ваш профиль.\n\n👁 <b>Публичная ссылка для клиентов:</b>\n${pageUrl}\n\nПоделитесь публичной ссылкой в Instagram и TikTok — клиенты смогут записаться онлайн.`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: masterChatId,
          text: replyText,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }).catch(() => {});
    }
  }

  return res.status(200).json({ success: true, slug, url: pageUrl, editToken });
}
