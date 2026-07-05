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

  // Each save creates a new file under masters/{slug}/ instead of overwriting one —
  // avoids Vercel Blob's CDN caching stale content at a reused URL. Pick the newest.
  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}/&limit=100`,
    { headers: { Authorization: `Bearer ${blobToken}` } }
  );
  if (!listRes.ok) return res.status(500).json({ error: 'Storage error' });
  const list = await listRes.json();
  const existingBlobs = (list.blobs || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  let masterBlob = existingBlobs[0];
  let legacyBlob = null;

  // Fall back to the old flat masters/{slug}.json layout for masters created before this scheme existed
  if (!masterBlob) {
    const legacyRes = await fetch(
      `https://blob.vercel-storage.com/?prefix=masters/${slug}.json&limit=1`,
      { headers: { Authorization: `Bearer ${blobToken}` } }
    );
    const legacyList = await legacyRes.json().catch(() => ({}));
    legacyBlob = legacyList.blobs?.[0];
    masterBlob = legacyBlob;
  }
  if (!masterBlob) return res.status(404).json({ error: 'Master not found' });

  const existingRes = await fetch(masterBlob.downloadUrl || masterBlob.url, {
    headers: { Authorization: `Bearer ${blobToken}` }
  });
  const existing = await existingRes.json();
  if (existing.editToken !== editToken) return res.status(403).json({ error: 'Forbidden' });

  // Save — keep editToken, update everything else
  const payload = { ...existing, ...data, editToken: existing.editToken, updatedAt: new Date().toISOString() };
  delete payload.token;

  const r = await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(`masters/${slug}/${Date.now()}.json`)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': 'application/json',
      'x-api-version': '12',
      'x-add-random-suffix': '0',
      'x-vercel-blob-access': 'private'
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(500).json({ error: 'Storage error', details: err });
  }

  // Best-effort cleanup: keep only the 3 most recent versions for this master,
  // and drop the legacy flat file once migrated to the new folder layout
  const stale = existingBlobs.slice(2).concat(legacyBlob ? [legacyBlob] : []);
  if (stale.length) {
    await fetch('https://blob.vercel-storage.com/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${blobToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ urls: stale.map(b => b.url) })
    }).catch(() => {});
  }

  return res.status(200).json({ success: true, slug, url: `https://beautymaster-by.vercel.app/master/${slug}` });
}
