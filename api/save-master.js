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
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body || {};
  if (!data.name) return res.status(400).json({ error: 'Name required' });

  const slug  = data.slug || toSlug(data.name);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'Storage not configured' });

  const payload = { ...data, slug, updatedAt: new Date().toISOString() };

  const r = await fetch(`https://blob.vercel-storage.com/masters/${slug}.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'content-type': 'application/json',
      'x-vercel-blob-add-random-suffix': '0',
      'x-vercel-blob-access': 'public'
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(500).json({ error: 'Storage error', details: err });
  }

  const pageUrl = `https://beautymaster-by.vercel.app/master/${slug}`;
  return res.status(200).json({ success: true, slug, url: pageUrl });
}
