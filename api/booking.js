export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, name, phone, service, date, time, message, masterUsername } = req.body || {};

  const token      = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!token) return res.status(500).json({ error: 'Bot not configured' });

  // Find master's chat_id from Redis, fallback to admin
  let targetChatId = adminChatId;
  if (redisUrl && redisToken && masterUsername) {
    const clean = masterUsername.replace('@', '').toLowerCase();
    const r = await fetch(`${redisUrl}/get/chatid:${clean}`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    }).catch(() => null);
    if (r?.ok) {
      const data = await r.json().catch(() => null);
      if (data?.result) targetChatId = data.result;
    }
  }

  if (!targetChatId) return res.status(500).json({ error: 'No recipient found' });

  let text = '';
  if (type === 'callback') {
    text =
      `📞 <b>Заказать звонок!</b>\n\n` +
      `👤 <b>Имя:</b> ${name || '—'}\n` +
      `📱 <b>Телефон:</b> ${phone || '—'}`;
  } else if (type === 'booking') {
    text =
      `📅 <b>Новая запись!</b>\n\n` +
      `👤 <b>Клиент:</b> ${name || '—'}\n` +
      `📱 <b>Телефон:</b> ${phone || '—'}\n` +
      `💅 <b>Услуга:</b> ${service || '—'}\n` +
      `📆 <b>Дата:</b> ${date || '—'}\n` +
      `🕐 <b>Время:</b> ${time || '—'}`;
  } else {
    text =
      `✉️ <b>Новое сообщение!</b>\n\n` +
      `👤 <b>Имя:</b> ${name || '—'}\n` +
      `📱 <b>Телефон:</b> ${phone || '—'}\n` +
      `💬 <b>Сообщение:</b> ${message || '—'}`;
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: targetChatId, text, parse_mode: 'HTML' })
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(500).json({ error: 'Telegram error', details: data });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Network error' });
  }
}
