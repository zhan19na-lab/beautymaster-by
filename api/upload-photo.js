export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-slug, x-token, x-photo-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const slug      = req.headers['x-slug'];
  const token     = req.headers['x-token'];
  const photoType = req.headers['x-photo-type'] || 'portfolio'; // 'avatar' | 'portfolio'
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!slug || !token || !blobToken) return res.status(400).json({ error: 'Missing params' });

  // Verify owner token
  const listRes = await fetch(
    `https://blob.vercel-storage.com/?prefix=masters/${slug}&limit=100`,
    { headers: { Authorization: `Bearer ${blobToken}` } }
  );
  if (!listRes.ok) return res.status(500).json({ error: 'Storage error' });
  const list = await listRes.json();
  const exactPathname = `masters/${slug}.json`;
  const masterBlob = (list.blobs || [])
    .filter(b => b.pathname === exactPathname)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  if (!masterBlob) return res.status(404).json({ error: 'Master not found' });

  const masterDataRes = await fetch(masterBlob.downloadUrl || masterBlob.url, {
    headers: { Authorization: `Bearer ${blobToken}` }
  });
  const masterData = await masterDataRes.json();
  if (masterData.editToken !== token) return res.status(403).json({ error: 'Forbidden' });

  // Read raw body as buffer
  const MAX_SIZE = photoType === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_SIZE) return res.status(413).json({ error: `File too large (max ${Math.round(MAX_SIZE / 1024 / 1024)} MB)` });
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  if (!buffer.length) return res.status(400).json({ error: 'Empty file' });

  // Detect content type from first bytes — reject anything that isn't a recognized image
  let ext = null;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) ext = 'jpg';
  else if (buffer[0] === 0x89 && buffer[1] === 0x50) ext = 'png';
  else if (buffer[0] === 0x47 && buffer[1] === 0x49) ext = 'gif';
  else if (buffer[0] === 0x52 && buffer[1] === 0x49) ext = 'webp';
  if (!ext) return res.status(400).json({ error: 'Unsupported file type — only JPG, PNG, GIF, WEBP are allowed' });
  const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  // Upload photo to Blob
  const filename = photoType === 'avatar'
    ? `photos/${slug}-avatar.${ext}`
    : `photos/${slug}-portfolio-${Date.now()}.${ext}`;

  const uploadRes = await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(filename)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': contentType,
      'x-api-version': '12',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-vercel-blob-access': 'private'
    },
    body: buffer
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return res.status(500).json({ error: 'Upload failed', details: err });
  }

  const uploadData = await uploadRes.json();
  const photoUrl = uploadData.url;

  // Update master profile
  if (photoType === 'avatar') {
    masterData.photo = photoUrl;
  } else {
    if (!masterData.photos) masterData.photos = [];
    masterData.photos.push(photoUrl);
  }
  masterData.updatedAt = new Date().toISOString();

  await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(masterBlob.pathname)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': 'application/json',
      'x-api-version': '12',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-vercel-blob-access': 'private'
    },
    body: JSON.stringify(masterData)
  });

  return res.status(200).json({ success: true, url: photoUrl });
}
