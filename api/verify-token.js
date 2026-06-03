export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { slug, token } = req.query;
  if (!slug || !token) return res.status(400).json({ valid: false });

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return res.status(500).json({ valid: false });

  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}&limit=10&_=${Date.now()}`,
    { headers: { Authorization: `Bearer ${blobToken}`, 'Cache-Control': 'no-cache' } }
  );
  if (!listRes.ok) return res.status(500).json({ valid: false, step: 'list' });

  const list = await listRes.json();
  const blobs = list.blobs || [];
  if (!blobs.length) return res.status(404).json({ valid: false, step: 'no-blob' });

  // Try each blob (newest first) until we find matching token
  for (const blob of blobs) {
    try {
      const fetchUrl = blob.downloadUrl || blob.url;
      const dataRes = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${blobToken}`, 'Cache-Control': 'no-cache' }
      });
      if (!dataRes.ok) continue;
      const data = await dataRes.json();
      if (data.editToken === token) return res.status(200).json({ valid: true });
    } catch { continue; }
  }

  return res.status(200).json({ valid: false, step: 'token-mismatch' });
}
