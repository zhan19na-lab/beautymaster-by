export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, direction, answers } = req.body || {};
  if (!name || !answers) return res.status(400).json({ error: 'Missing fields' });

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: 'Bot not configured' });

  const lines = answers.map((a, i) => `<i>${i + 1}. ${a.question}</i>\n<b>→ ${a.answer || '—'}</b>`).join('\n\n');

  const text = `📋 <b>Анкета заполнена!</b>\n\n👤 <b>${name}</b> · ${direction}\n\n${lines}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(500).json({ error: 'Telegram error', details: data });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Network error' });
  }
}
