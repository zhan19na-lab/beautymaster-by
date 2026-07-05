export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return res.status(500).json({ error: 'No blob token' });

  try {
    const listRes = await fetch('https://blob.vercel-storage.com?prefix=masters/', {
      headers: { Authorization: `Bearer ${blobToken}` }
    });
    if (!listRes.ok) return res.status(500).json({ error: 'Blob list failed' });

    const listData = await listRes.json();
    const allBlobs = listData.blobs || [];

    // De-dupe: multiple blob versions can exist under the same pathname; keep only the newest per master
    const newestByPathname = new Map();
    for (const blob of allBlobs) {
      const existing = newestByPathname.get(blob.pathname);
      if (!existing || new Date(blob.uploadedAt) > new Date(existing.uploadedAt)) {
        newestByPathname.set(blob.pathname, blob);
      }
    }
    const blobs = [...newestByPathname.values()];

    const masters = await Promise.all(blobs.map(async blob => {
      try {
        const r = await fetch(blob.url);
        if (!r.ok) return null;
        const m = await r.json();

        const now = new Date();
        const created = new Date(m.createdAt || blob.uploadedAt);
        const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, 21 - daysSince);
        const bookings = m.bookings || [];

        const week1 = bookings.filter(b => {
          const d = new Date(b.createdAt);
          const diff = Math.floor((d - created) / (1000 * 60 * 60 * 24));
          return diff < 7;
        }).length;
        const week2 = bookings.filter(b => {
          const d = new Date(b.createdAt);
          const diff = Math.floor((d - created) / (1000 * 60 * 60 * 24));
          return diff >= 7 && diff < 14;
        }).length;
        const week3 = bookings.filter(b => {
          const d = new Date(b.createdAt);
          const diff = Math.floor((d - created) / (1000 * 60 * 60 * 24));
          return diff >= 14;
        }).length;

        return {
          slug: m.slug,
          name: m.name,
          specialty: m.specialty,
          phone: m.phone,
          tgUsername: m.tgUsername,
          createdAt: m.createdAt || blob.uploadedAt,
          daysSince,
          daysLeft,
          totalBookings: bookings.length,
          week1, week2, week3,
          trend: week2 > week1 ? 'up' : week2 < week1 ? 'down' : 'stable'
        };
      } catch { return null; }
    }));

    const result = masters.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ masters: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
