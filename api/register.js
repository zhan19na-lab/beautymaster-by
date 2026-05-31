function toSlug(name) {
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  };
  return name.toLowerCase()
    .split('').map(c => map[c] ?? (c === ' ' ? '-' : c))
    .join('').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, direction, contact, tgUsername } = req.body || {};
  if (!name || !direction || !contact) return res.status(400).json({ error: 'Missing fields' });

  const slug    = toSlug(name);
  const pageUrl = `https://beautymaster-by.vercel.app/master/${slug}`;
  const token   = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_CHAT_ID;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // Create master page in Blob storage
  if (blobToken) {
    const masterData = {
      slug, name, specialty: direction, phone: contact,
      tgUsername: tgUsername?.replace('@','') || '',
      city: 'Беларусь',
      bio: '',
      services: [{ name: 'Услуга 1', desc: 'Описание', price: 'Уточняйте' }],
      schedule: {
        mon: { enabled: true,  from: '09:00', to: '19:00' },
        tue: { enabled: true,  from: '09:00', to: '19:00' },
        wed: { enabled: true,  from: '09:00', to: '19:00' },
        thu: { enabled: true,  from: '09:00', to: '19:00' },
        fri: { enabled: true,  from: '09:00', to: '19:00' },
        sat: { enabled: true,  from: '10:00', to: '17:00' },
        sun: { enabled: false }
      },
      bookedSlots: [],
      createdAt: new Date().toISOString()
    };

    const blobResp = await fetch(`https://blob.vercel-storage.com/masters/${slug}.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${blobToken}`,
        'content-type': 'application/json',
        'x-vercel-blob-add-random-suffix': '0',
        'x-vercel-blob-access': 'public'
      },
      body: JSON.stringify(masterData)
    });
    if (!blobResp.ok) {
      const blobErr = await blobResp.text();
      console.error('BLOB ERROR:', blobResp.status, blobErr);
    } else {
      console.log('BLOB OK:', await blobResp.text());
    }
  }

  // Notify admin
  if (token && adminId) {
    const tgInfo = tgUsername ? `\n📱 <b>Telegram:</b> @${tgUsername.replace('@','')}` : '';
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: `🌸 <b>Новая регистрация мастера!</b>\n\n👤 <b>Имя:</b> ${name}\n💅 <b>Направление:</b> ${direction}\n📞 <b>Контакт:</b> ${contact}${tgInfo}\n\n🔗 <b>Страница:</b> ${pageUrl}`,
        parse_mode: 'HTML'
      })
    }).catch(() => {});
  }

  // Auto-reply to master if chat_id known
  if (token && tgUsername) {
    const clean = tgUsername.replace('@','').toUpperCase().replace(/[^A-Z0-9]/g,'_');
    const masterChatId = process.env[`MASTER_${clean}`];
    if (masterChatId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: masterChatId,
          text: `✅ <b>Заявка получена, ${name}!</b>\n\nЯ получила вашу заявку и свяжусь с вами в ближайшее время.\n\n🔗 <b>Ваша страница уже готова:</b>\n${pageUrl}`,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      }).catch(() => {});
    }
  }

  return res.status(200).json({ success: true, slug, url: pageUrl });
}
