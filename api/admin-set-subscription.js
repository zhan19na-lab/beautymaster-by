export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug, months = 1 } = req.body || {};
  if (!slug) return res.status(400).json({ error: 'Slug required' });

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return res.status(500).json({ error: 'No blob token' });

  try {
    const listRes = await fetch(`https://blob.vercel-storage.com/?prefix=masters/${slug}/&limit=100`, {
      headers: { Authorization: `Bearer ${blobToken}` }
    });
    const listData = await listRes.json();
    const existingBlobs = (listData.blobs || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    let blob = existingBlobs[0];
    let legacyBlob = null;

    // Fall back to the old flat masters/{slug}.json layout for masters created before this scheme existed
    if (!blob) {
      const legacyRes = await fetch(
        `https://blob.vercel-storage.com/?prefix=masters/${slug}.json&limit=1`,
        { headers: { Authorization: `Bearer ${blobToken}` } }
      );
      const legacyList = await legacyRes.json().catch(() => ({}));
      legacyBlob = legacyList.blobs?.[0];
      blob = legacyBlob;
    }
    if (!blob) return res.status(404).json({ error: 'Master not found' });

    const masterRes = await fetch(blob.downloadUrl || blob.url, {
      headers: { Authorization: `Bearer ${blobToken}` }
    });
    const master = await masterRes.json();

    // Set or extend subscription
    const now = new Date();
    const currentExpiry = master.subscriptionExpiry ? new Date(master.subscriptionExpiry) : now;
    const base = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    master.subscriptionExpiry = newExpiry.toISOString();
    master.isPaid = true;

    await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(`masters/${slug}/${Date.now()}.json`)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${blobToken}`,
        'content-type': 'application/json',
        'x-api-version': '12',
        'x-add-random-suffix': '0',
        'x-vercel-blob-access': 'private'
      },
      body: JSON.stringify(master)
    });

    const stale = existingBlobs.slice(2).concat(legacyBlob ? [legacyBlob] : []);
    if (stale.length) {
      await fetch('https://blob.vercel-storage.com/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${blobToken}`, 'content-type': 'application/json' },
        body: JSON.stringify({ urls: stale.map(b => b.url) })
      }).catch(() => {});
    }

    // Notify admin in Telegram
    const token   = process.env.TELEGRAM_BOT_TOKEN;
    const chatId  = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ <b>Подписка продлена!</b>\n\n👤 <b>${master.name}</b>\n📅 До: ${newExpiry.toLocaleDateString('ru-RU')}`,
          parse_mode: 'HTML'
        })
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, subscriptionExpiry: newExpiry.toISOString() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
