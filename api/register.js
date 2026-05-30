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

  const token       = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_CHAT_ID;

  // Notify admin about new registration
  if (token && adminChatId) {
    const tgInfo = tgUsername ? `\n📱 <b>Telegram:</b> @${tgUsername.replace('@', '')}` : '';
    const adminText =
      `🌸 <b>Новая регистрация мастера!</b>\n\n` +
      `👤 <b>Имя:</b> ${name}\n` +
      `💅 <b>Направление:</b> ${direction}\n` +
      `📞 <b>Контакт:</b> ${contact}${tgInfo}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text: adminText, parse_mode: 'HTML' })
    }).catch(() => {});
  }

  // Auto-reply to master if their chat_id is already known (wrote /start before registration)
  if (token && tgUsername) {
    const clean  = tgUsername.replace('@', '').toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const masterChatId = process.env[`MASTER_${clean}`];

    if (masterChatId) {
      const masterText =
        `✅ <b>Заявка получена, ${name}!</b>\n\n` +
        `Мы получили вашу заявку и свяжемся с вами в ближайшее время.\n\n` +
        `💅 <b>Направление:</b> ${direction}\n` +
        `📞 <b>Контакт:</b> ${contact}\n\n` +
        `Пока можете посмотреть как будет выглядеть ваша страница 👇\n` +
        `beautymaster-by.vercel.app/pages/master-profile.html`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: masterChatId, text: masterText, parse_mode: 'HTML' })
      }).catch(() => {});
    }
  }

  return res.status(200).json({ success: true });
}
