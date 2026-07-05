export default async function handler(req, res) {
  // Vercel cron jobs send GET requests with authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token     = process.env.TELEGRAM_BOT_TOKEN;
  const adminId   = process.env.TELEGRAM_CHAT_ID;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token || !adminId || !blobToken) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  // List all masters from Blob storage
  const listRes = await fetch('https://blob.vercel-storage.com/masters?prefix=masters/', {
    headers: { Authorization: `Bearer ${blobToken}` }
  }).catch(() => null);

  if (!listRes?.ok) return res.status(500).json({ error: 'Blob list failed' });

  const listData = await listRes.json();
  const allBlobs = listData.blobs || [];

  // Each master lives under masters/{slug}/{timestamp}.json — keep only the newest file per slug
  const newestByPathname = new Map();
  for (const blob of allBlobs) {
    const slugKey = blob.pathname.split('/')[1];
    const existing = newestByPathname.get(slugKey);
    if (!existing || new Date(blob.uploadedAt) > new Date(existing.uploadedAt)) {
      newestByPathname.set(slugKey, blob);
    }
  }
  const blobs = [...newestByPathname.values()];

  const now = new Date();
  const notified = [];

  for (const blob of blobs) {
    try {
      const masterRes = await fetch(blob.url);
      if (!masterRes.ok) continue;
      const master = await masterRes.json();

      if (!master.createdAt) continue;

      const created = new Date(master.createdAt);
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

      // Notify on day 19 (2 days before 21-day trial ends)
      if (diffDays === 19) {
        const name = master.name || 'Мастер';
        const slug = master.slug || '';
        const tg   = master.tgUsername ? `@${master.tgUsername}` : '';

        // Notify admin
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminId,
            text: `⏰ <b>Триал заканчивается через 2 дня!</b>\n\n👤 <b>${name}</b>${tg ? ` · ${tg}` : ''}\n🔗 beautymaster-by.vercel.app/master/${slug}\n\n📞 Позвоните и предложите продолжение за <b>от 500 BYN</b>`,
            parse_mode: 'HTML'
          })
        }).catch(() => {});

        // Notify master if we know their chat_id
        if (master.tgUsername) {
          const clean = master.tgUsername.toUpperCase().replace(/[^A-Z0-9]/g, '_');
          const masterChatId = process.env[`MASTER_${clean}`];
          if (masterChatId) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: masterChatId,
                text: `🌸 <b>${name}, ваш бесплатный период заканчивается через 2 дня!</b>\n\n<i>Надеюсь, вы успели оценить все возможности вашей страницы. Если хотите продолжить — я готова помочь вам развить её дальше.</i>\n\n<i>Свяжитесь со мной — обсудим как сделать ваш сайт ещё лучше.</i> 🤍`,
                parse_mode: 'HTML'
              })
            }).catch(() => {});
          }
        }

        notified.push(name);
      }

      // Check subscription expiry (3 days before)
      if (master.subscriptionExpiry && master.isPaid) {
        const expiry = new Date(master.subscriptionExpiry);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysLeft === 3) {
          // Notify admin
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminId,
              text: `💳 <b>Подписка заканчивается через 3 дня!</b>\n\n👤 <b>${name}</b>${master.tgUsername ? ` · @${master.tgUsername}` : ''}\n📞 ${master.phone || '—'}\n\n💰 Напомните оплатить <b>25 BYN</b> за следующий месяц`,
              parse_mode: 'HTML'
            })
          }).catch(() => {});

          // Notify master
          if (master.tgUsername) {
            const clean = master.tgUsername.toUpperCase().replace(/[^A-Z0-9]/g,'_');
            const masterChatId = process.env[`MASTER_${clean}`];
            if (masterChatId) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: masterChatId,
                  text: `⚠️ <b>${name}, ваша подписка заканчивается через 3 дня!</b>\n\n<i>Чтобы ваша страница продолжала работать и клиенты могли записываться — продлите подписку.</i>\n\n<i>Свяжитесь со мной для оплаты — всего 25 BYN в месяц.</i> 🤍`,
                  parse_mode: 'HTML'
                })
              }).catch(() => {});
            }
          }
        }
      }
    } catch { continue; }
  }

  return res.status(200).json({ success: true, notified });
}
