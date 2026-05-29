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

    // Reply to master
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Отлично! Теперь вы будете получать уведомления о новых записях от клиентов прямо сюда.',
        parse_mode: 'HTML'
      })
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true });
}
