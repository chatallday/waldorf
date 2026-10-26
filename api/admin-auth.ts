/**
 * Admin Auth Proxy — server-side verification
 * Keeps admin credentials out of the client bundle and hides all admin records.
 * Uses TEABLE_API_KEY from server env (never exposed to browser).
 */

const TEABLE_API_KEY = process.env.TEABLE_API_KEY || "";
const TEABLE_TABLE_ID_ADMIN_ALERTS = "tblbxAGreFEyE7Pi9PE";

async function fetchAdminRecords() {
  const all: any[] = [];
  let skip = 0;
  const take = 100;
  while (true) {
    const res = await fetch(`https://app.teable.io/api/table/${TEABLE_TABLE_ID_ADMIN_ALERTS}/record?take=${take}&skip=${skip}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEABLE_API_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Teable fetch failed: ${res.status}`);
    const data = await res.json();
    const records = data.records || [];
    if (records.length === 0) break;
    all.push(...records);
    if (records.length < take) break;
    skip += records.length;
  }
  return all.filter(r => r.fields && r.fields.Alert_Type === 'Admin User');
}

function parseAdminRecord(rec: any) {
  let email = 'admin@thewaldorfpath.com';
  let password = '';
  try {
    const parsed = JSON.parse(rec.fields.Description || '{}');
    email = parsed.email || email;
    password = parsed.password || '';
  } catch {}
  return { id: rec.id, email, password };
}

export default async function handler(req: any, res: any) {
  if (!TEABLE_API_KEY) {
    return res.status(500).json({ error: 'TEABLE_API_KEY not configured' });
  }

  // CORS for same-origin (Vite dev proxy handles it, but be safe)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // List admins WITHOUT passwords (for admin panel display)
      const records = await fetchAdminRecords();
      const admins = records.map(r => {
        const { id, email } = parseAdminRecord(r);
        return { id, email };
      });
      if (admins.length === 0) {
        return res.status(200).json([{ id: 'default', email: 'admin@thewaldorfpath.com' }]);
      }
      return res.status(200).json(admins);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { action, email, password } = body || {};

      if (action === 'verify') {
        if (!email || !password) {
          return res.status(400).json({ error: 'Missing email or password' });
        }
        const records = await fetchAdminRecords();
        // If no admin records exist, allow default admin (for first setup)
        if (records.length === 0) {
          // No admins configured yet — treat as not found
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const match = records.map(parseAdminRecord).find(a => a.email.toLowerCase() === String(email).toLowerCase().trim() && a.password === String(password));
        if (match) {
          return res.status(200).json({ success: true, admin: { id: match.id, email: match.email } });
        }
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (action === 'list') {
        const records = await fetchAdminRecords();
        const admins = records.map(r => {
          const { id, email } = parseAdminRecord(r);
          return { id, email };
        });
        return res.status(200).json(admins.length ? admins : [{ id: 'default', email: 'admin@thewaldorfpath.com' }]);
      }

      return res.status(400).json({ error: 'Unknown action. Use verify or list.' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[admin-auth] Error:', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}