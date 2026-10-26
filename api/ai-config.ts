/**
 * AI Config Store — Teable-backed key management
 * Stores Gemini / OpenAI keys in Teable (Admin Alerts table, Alert_Type='AI Config')
 * so the superadmin dash can update them without touching Vercel env vars.
 * Vercel env vars remain as fallback if no Teable config exists.
 */

const TEABLE_API_KEY = process.env.TEABLE_API_KEY || "";
const TABLE_ID = "tblbxAGreFEyE7Pi9PE"; // Admin Alerts

async function fetchConfigRecord(): Promise<any | null> {
  let skip = 0;
  const take = 100;
  while (true) {
    const res = await fetch(`https://app.teable.io/api/table/${TABLE_ID}/record?take=${take}&skip=${skip}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEABLE_API_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`Teable fetch failed: ${res.status}`);
    const data = await res.json();
    const records = data.records || [];
    const match = records.find((r: any) => r.fields && r.fields.Alert_Type === 'AI Config');
    if (match) return match;
    if (records.length < take) break;
    skip += records.length;
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (!TEABLE_API_KEY) {
    return res.status(500).json({ error: 'TEABLE_API_KEY not configured' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rec = await fetchConfigRecord();
      if (!rec) {
        // Fallback to env vars if no Teable config yet
        return res.status(200).json({
          geminiApiKey: process.env.GEMINI_API_KEY || "",
          openaiApiKey: process.env.OPENAI_API_KEY || "",
          source: 'env',
        });
      }
      try {
        const parsed = JSON.parse(rec.fields.Description || '{}');
        return res.status(200).json({
          geminiApiKey: parsed.geminiApiKey || process.env.GEMINI_API_KEY || "",
          openaiApiKey: parsed.openaiApiKey || process.env.OPENAI_API_KEY || "",
          updatedAt: parsed.updatedAt || rec.lastModifiedTime,
          source: 'teable',
          recordId: rec.id,
        });
      } catch {
        return res.status(200).json({
          geminiApiKey: process.env.GEMINI_API_KEY || "",
          openaiApiKey: process.env.OPENAI_API_KEY || "",
          source: 'env',
        });
      }
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { geminiApiKey, openaiApiKey } = body || {};

      // Basic validation — allow empty strings to clear, but require at least one field
      if (geminiApiKey === undefined && openaiApiKey === undefined) {
        return res.status(400).json({ error: 'Missing geminiApiKey or openaiApiKey' });
      }

      const existing = await fetchConfigRecord();
      const prev = (() => {
        if (!existing) return {};
        try { return JSON.parse(existing.fields.Description || '{}'); } catch { return {}; }
      })();

      const next = {
        geminiApiKey: geminiApiKey !== undefined ? String(geminiApiKey) : (prev.geminiApiKey || ""),
        openaiApiKey: openaiApiKey !== undefined ? String(openaiApiKey) : (prev.openaiApiKey || ""),
        updatedAt: new Date().toISOString(),
      };

      const payload = {
        'Alert_Type': 'AI Config',
        'Description': JSON.stringify(next),
        'Timestamp': new Date().toISOString(),
        'Status': 'Resolved',
      };

      if (existing) {
        const upd = await fetch(`https://app.teable.io/api/table/${TABLE_ID}/record/${existing.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEABLE_API_KEY}`,
          },
          body: JSON.stringify({ record: { fields: payload } }),
        });
        if (!upd.ok) {
          const t = await upd.text();
          throw new Error(`Teable update failed: ${upd.status} ${t}`);
        }
      } else {
        const cre = await fetch(`https://app.teable.io/api/table/${TABLE_ID}/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEABLE_API_KEY}`,
          },
          body: JSON.stringify({ records: [{ fields: payload }], typecast: true }),
        });
        if (!cre.ok) {
          const t = await cre.text();
          throw new Error(`Teable create failed: ${cre.status} ${t}`);
        }
      }

      return res.status(200).json({ success: true, ...next });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[ai-config] Error:', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}