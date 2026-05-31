export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const slug  = req.query.slug;
  if (!slug) return res.status(400).json({ error: 'Slug required' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'Storage not configured' });

  // List blobs with this slug prefix
  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}.json&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!listRes.ok) return res.status(500).json({ error: 'Storage error' });

  const list = await listRes.json();
  const blob = list.blobs?.[0];
  if (!blob) return res.status(404).json({ error: 'Master not found' });

  const fetchUrl = blob.downloadUrl || blob.url;
  const dataRes = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!dataRes.ok) return res.status(500).json({ error: 'Failed to load data' });

  const data = await dataRes.json();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(data);
}
