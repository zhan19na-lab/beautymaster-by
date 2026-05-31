export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  const { slug, token } = req.query;
  if (!slug || !token) return res.status(400).json({ valid: false });

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return res.status(500).json({ valid: false });

  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}&limit=1`,
    { headers: { Authorization: `Bearer ${blobToken}` } }
  );
  if (!listRes.ok) return res.status(500).json({ valid: false });

  const list = await listRes.json();
  const blob = list.blobs?.[0];
  if (!blob) return res.status(404).json({ valid: false });

  const fetchUrl = blob.downloadUrl || blob.url;
  const dataRes = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${blobToken}` } });
  if (!dataRes.ok) return res.status(500).json({ valid: false });

  const data = await dataRes.json();
  const valid = data.editToken === token;
  return res.status(200).json({ valid });
}
