export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body || {};
  const { slug, token: editToken } = data;
  if (!slug || !editToken) return res.status(400).json({ error: 'Missing slug or token' });

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return res.status(500).json({ error: 'Storage not configured' });

  // Verify token
  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}&limit=1`,
    { headers: { Authorization: `Bearer ${blobToken}` } }
  );
  if (!listRes.ok) return res.status(500).json({ error: 'Storage error' });
  const list = await listRes.json();
  const masterBlob = list.blobs?.[0];
  if (!masterBlob) return res.status(404).json({ error: 'Master not found' });

  const existingRes = await fetch(masterBlob.downloadUrl || masterBlob.url, {
    headers: { Authorization: `Bearer ${blobToken}` }
  });
  const existing = await existingRes.json();
  if (existing.editToken !== editToken) return res.status(403).json({ error: 'Forbidden' });

  // Save — keep editToken, update everything else
  const payload = { ...existing, ...data, editToken: existing.editToken, updatedAt: new Date().toISOString() };
  delete payload.token;

  const r = await fetch(`https://blob.vercel-storage.com/${masterBlob.pathname}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': 'application/json',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-vercel-blob-access': 'private'
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(500).json({ error: 'Storage error', details: err });
  }

  return res.status(200).json({ success: true, slug, url: `https://beautymaster-by.vercel.app/master/${slug}` });
}
