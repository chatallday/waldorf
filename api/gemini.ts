import { GoogleGenAI, Type } from "@google/genai";

const TEABLE_API_KEY_TB = process.env.TEABLE_API_KEY || "";
const AI_CONFIG_TABLE = "tblbxAGreFEyE7Pi9PE";

async function getGeminiKey(): Promise<string> {
  // Try Teable-backed config first (set via superadmin dash)
  if (TEABLE_API_KEY_TB) {
    try {
      let skip = 0;
      const take = 100;
      while (true) {
        const r = await fetch(`https://app.teable.io/api/table/${AI_CONFIG_TABLE}/record?take=${take}&skip=${skip}`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEABLE_API_KEY_TB}` },
        });
        if (!r.ok) break;
        const d = await r.json();
        const recs = d.records || [];
        const match = recs.find((x: any) => x.fields && x.fields.Alert_Type === 'AI Config');
        if (match) {
          try {
            const j = JSON.parse(match.fields.Description || '{}');
            if (j.geminiApiKey && String(j.geminiApiKey).trim()) return String(j.geminiApiKey).trim();
          } catch {}
        }
        if (recs.length < take) break;
        skip += recs.length;
      }
    } catch (e) {
      console.warn('[gemini-proxy] Teable config fetch failed, falling back to env:', e);
    }
  }
  return process.env.GEMINI_API_KEY || "";
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = await getGeminiKey();
  if (!apiKey) {
    console.error('[gemini-proxy] GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    const { model, contents, config } = req.body || {};

    if (!model || !contents) {
      return res.status(400).json({ error: 'Missing model or contents' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text;
    return res.status(200).json({ text });
  } catch (error) {
    console.error('[gemini-proxy] Error:', error);
    return res.status(500).json({ error: error.message || 'Gemini proxy error' });
  }
}