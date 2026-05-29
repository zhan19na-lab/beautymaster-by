export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, direction, contact } = req.body || {};

  if (!name || !direction || !contact) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Bot not configured' });
  }

  const text =
    `🌸 <b>Новая заявка!</b>\n\n` +
    `👤 <b>Имя:</b> ${name}\n` +
    `💅 <b>Направление:</b> ${direction}\n` +
    `📞 <b>Контакт:</b> ${contact}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });

    const data = await tgRes.json();
    if (!data.ok) return res.status(500).json({ error: 'Telegram error', details: data });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Network error' });
  }
}
