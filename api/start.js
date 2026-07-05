// Telegram webhook — handles /start from masters
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const message  = req.body?.message;
  if (!message) return res.status(200).end();

  const text     = message.text || '';
  const chatId   = String(message.chat?.id || '');
  const username = (message.from?.username || '').toLowerCase();

  const token        = process.env.TELEGRAM_BOT_TOKEN;
  const vercelToken  = process.env.VERCEL_API_TOKEN;
  const projectId    = process.env.VERCEL_PROJECT_ID;
  const teamId       = process.env.VERCEL_TEAM_ID;

  if (!token) return res.status(500).end();

  if (text.startsWith('/start') && username && vercelToken && projectId) {
    const envKey = `MASTER_${username.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

    // Save chat_id as Vercel env var
    const teamParam = teamId ? `?teamId=${teamId}` : '';

    // Try to update first, then create
    const existing = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env${teamParam}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    ).then(r => r.json()).catch(() => ({ envs: [] }));

    const existingVar = (existing.envs || []).find(e => e.key === envKey);

    if (existingVar) {
      await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${existingVar.id}${teamParam}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: chatId })
        }
      ).catch(() => {});
    } else {
      await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env${teamParam}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: envKey,
            value: chatId,
            type: 'plain',
            target: ['production', 'preview']
          })
        }
      ).catch(() => {});
    }

    // Trigger redeploy so new env var is available
    await fetch(
      `https://api.vercel.com/v13/deployments${teamParam}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'beautymaster-by', projectId, target: 'production' })
      }
    ).catch(() => {});

    // Reply to master with two options
    const replyText =
      `✅ <b>Бот подключён! Добро пожаловать в BeautyMaster.by 🌸</b>\n\n` +
      `Ваша демо-страница уже готова. Выберите как вам удобнее:\n\n` +

      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🅰️ <b>Самостоятельно — бесплатно 21 день</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Откройте вашу страницу и настройте под себя:\n` +
      `👉 beautymaster-by.vercel.app/pages/master-profile.html\n\n` +
      `📝 <b>Как редактировать:</b>\n` +
      `1️⃣ Дважды кликните на <b>имя</b> — введите своё\n` +
      `2️⃣ Дважды кликните на <b>описание</b> — напишите о себе\n` +
      `3️⃣ Дважды кликните на любую <b>цену</b> — поставьте свою\n` +
      `4️⃣ Когда готово — напишите сюда <b>"Готово"</b> ✅\n\n` +

      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🅱️ <b>Под ключ — скидка 50% 🔥</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Напишите мне прямо сейчас — и я создам страницу, от которой ваши клиенты не смогут оторваться. Красиво, стильно, под вас 🌸\n\n` +
      `Страница будет работать на вас 24/7 — пока вы делаете маникюр, а возможно уже спите — клиенты уже записываются 🔥\n\n` +
      `⚡ Готово за <b>2-4 дня</b> в зависимости от сложности\n` +
      `💰 Только сейчас скидка <b>50%</b> — от 250 BYN вместо 500 BYN\n\n` +
      `👇 Просто напишите мне прямо сюда, в этот чат — "Хочу VIP-страницу со скидкой 50%!"`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
