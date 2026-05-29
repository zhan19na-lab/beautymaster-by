// Webhook handler for /start command from masters
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const update = req.body;
  const message = update?.message;
  if (!message) return res.status(200).end();

  const text     = message.text || '';
  const chatId   = message.chat?.id;
  const username = message.from?.username?.toLowerCase();

  const token      = process.env.TELEGRAM_BOT_TOKEN;
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!token) return res.status(500).end();

  if (text.startsWith('/start') && username && redisUrl && redisToken) {
    // Save chat_id for this username
    await fetch(`${redisUrl}/set/chatid:${username}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: String(chatId) })
    }).catch(() => {});

    // Reply to master
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Отлично! Теперь вы будете получать уведомления о новых записях от клиентов.',
        parse_mode: 'HTML'
      })
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
