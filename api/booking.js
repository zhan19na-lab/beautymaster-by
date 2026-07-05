export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, name, phone, service, date, time, message, masterUsername, masterSlug } = req.body || {};

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function isValidPhone(v) {
    if (typeof v !== 'string' || !/^\+[\d\s\-()]+$/.test(v)) return false;
    const digits = v.replace(/\D/g, '');
    return digits.length >= 11 && digits.length <= 12;
  }

  if (phone !== undefined && phone !== null && phone !== '' && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }

  const token       = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) return res.status(500).json({ error: 'Bot not configured' });

  // Find master's chat_id from env vars, fallback to admin
  let targetChatId = adminChatId;
  if (masterUsername) {
    const envKey = `MASTER_${masterUsername.replace('@','').toUpperCase().replace(/[^A-Z0-9]/g,'_')}`;
    const masterChatId = process.env[envKey];
    if (masterChatId) targetChatId = masterChatId;
  }

  if (!targetChatId) return res.status(500).json({ error: 'No recipient found' });

  let text = '';
  if (type === 'callback') {
    text = `📞 <b>Заказать звонок!</b>\n\n👤 <b>Имя:</b> ${escapeHtml(name)||'—'}\n📱 <b>Телефон:</b> ${escapeHtml(phone)||'—'}`;
  } else if (type === 'booking') {
    text = `📅 <b>Новая запись!</b>\n\n👤 <b>Клиент:</b> ${escapeHtml(name)||'—'}\n📱 <b>Телефон:</b> ${escapeHtml(phone)||'—'}\n💅 <b>Услуга:</b> ${escapeHtml(service)||'—'}\n📆 <b>Дата:</b> ${escapeHtml(date)||'—'}\n🕐 <b>Время:</b> ${escapeHtml(time)||'—'}`;
  } else {
    text = `✉️ <b>Новое сообщение!</b>\n\n👤 <b>Имя:</b> ${escapeHtml(name)||'—'}\n📱 <b>Телефон:</b> ${escapeHtml(phone)||'—'}\n💬 <b>Сообщение:</b> ${escapeHtml(message)||'—'}`;
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: targetChatId, text, parse_mode: 'HTML' })
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(500).json({ error: 'Telegram error', details: data });

    // Save booking to master's blob data
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    // Prefer the real slug sent by the page; masterUsername (Telegram handle) doesn't
    // necessarily match the slug, which is derived from the master's name at registration.
    const slug = masterSlug || masterUsername?.replace('@', '').toLowerCase();
    if (blobToken && slug) {
      try {
        const listRes = await fetch(`https://blob.vercel-storage.com/?prefix=masters/${slug}/&limit=100`, {
          headers: { Authorization: `Bearer ${blobToken}` }
        });
        const list = await listRes.json();
        const existingBlobs = (list.blobs || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        let masterBlob = existingBlobs[0];
        let legacyBlob = null;

        // Fall back to the old flat masters/{slug}.json layout for masters created before this scheme existed
        if (!masterBlob) {
          const legacyRes = await fetch(`https://blob.vercel-storage.com/?prefix=masters/${slug}.json&limit=1`, {
            headers: { Authorization: `Bearer ${blobToken}` }
          });
          const legacyList = await legacyRes.json().catch(() => ({}));
          legacyBlob = legacyList.blobs?.[0];
          masterBlob = legacyBlob;
        }

        if (masterBlob) {
          const masterRes = await fetch(masterBlob.downloadUrl || masterBlob.url, {
            headers: { Authorization: `Bearer ${blobToken}` }
          });
          const master = await masterRes.json();
          const bookings = master.bookings || [];
          bookings.push({
            type: type || 'booking',
            name: name || '—',
            phone: phone || '—',
            service: service || '—',
            date: date || '—',
            time: time || '—',
            createdAt: new Date().toISOString()
          });
          master.bookings = bookings;
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
        }
      } catch { /* non-critical */ }
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Network error' });
  }
}
