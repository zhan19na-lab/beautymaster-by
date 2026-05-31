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
    `https://blob.vercel-storage.com/?prefix=masters/${slug}&limit=1`,
    { headers: { Authorization: `Bearer ${blobToken}` } }
  );
  if (!listRes.ok) return res.status(500).json({ error: 'Storage error' });
  const list = await listRes.json();
  const masterBlob = list.blobs?.[0];
  if (!masterBlob) return res.status(404).json({ error: 'Master not found' });

  const masterDataRes = await fetch(masterBlob.downloadUrl || masterBlob.url, {
    headers: { Authorization: `Bearer ${blobToken}` }
  });
  const masterData = await masterDataRes.json();
  if (masterData.editToken !== token) return res.status(403).json({ error: 'Forbidden' });

  // Read raw body as buffer
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // Detect content type from first bytes
  let ext = 'jpg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) ext = 'png';
  else if (buffer[0] === 0x47 && buffer[1] === 0x49) ext = 'gif';
  else if (buffer[0] === 0x52 && buffer[1] === 0x49) ext = 'webp';
  const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  // Upload photo to Blob
  const filename = photoType === 'avatar'
    ? `photos/${slug}-avatar.${ext}`
    : `photos/${slug}-portfolio-${Date.now()}.${ext}`;

  const uploadRes = await fetch(`https://blob.vercel-storage.com/${filename}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': contentType,
      'x-vercel-blob-add-random-suffix': '0',
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
    masterData.avatarUrl = photoUrl;
  } else {
    if (!masterData.photos) masterData.photos = [];
    masterData.photos.push(photoUrl);
  }
  masterData.updatedAt = new Date().toISOString();

  await fetch(`https://blob.vercel-storage.com/${masterBlob.pathname}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${blobToken}`,
      'content-type': 'application/json',
      'x-vercel-blob-add-random-suffix': '0',
      'x-vercel-blob-access': 'private'
    },
    body: JSON.stringify(masterData)
  });

  return res.status(200).json({ success: true, url: photoUrl });
}
