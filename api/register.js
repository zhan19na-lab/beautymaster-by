export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, direction, contact, tgUsername } = req.body || {};

  if (!name || !direction || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Save master data to Redis (key: tg:username → chat_id будет сохранён позже через /start)
  if (redisUrl && redisToken && tgUsername) {
    const clean = tgUsername.replace('@', '').toLowerCase();
    const masterData = JSON.stringify({ name, direction, contact, tgUsername: clean, registeredAt: new Date().toISOString() });
    await fetch(`${redisUrl}/set/master:${clean}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: masterData })
    }).catch(() => {});
  }

  // Notify admin (you) about new registration
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (token && chatId) {
    const tgInfo = tgUsername ? `\n📱 <b>Telegram:</b> @${tgUsername.replace('@', '')}` : '';
    const text =
      `🌸 <b>Новая регистрация мастера!</b>\n\n` +
      `👤 <b>Имя:</b> ${name}\n` +
      `💅 <b>Направление:</b> ${direction}\n` +
      `📞 <b>Контакт:</b> ${contact}${tgInfo}\n\n` +
      `ℹ️ Попросите мастера написать боту @Beauty88888_bot команду /start`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    }).catch(() => {});
  }

  return res.status(200).json({ success: true });
}
