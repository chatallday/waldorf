/**
 * Vercel Serverless Cron Handler — The Waldorf Path
 * Schedule: 0 3 * * * (3:00 AM daily)
 * Purpose: Keep-awake ping to prevent database cold-start latency
 */

const TEABLE_API_KEY = process.env.TEABLE_API_KEY || "";
const TEABLE_TABLE_ID_MENTORS = "tbl6KvPXOhrVpXupA93";

export default async function handler(req: any, res: any) {
  // Only allow GET requests (Vercel cron sends GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TEABLE_API_KEY) {
    console.error('[Cron] TEABLE_API_KEY not set in environment');
    return res.status(500).json({ success: false, error: 'TEABLE_API_KEY not configured' });
  }

  const timestamp = new Date().toISOString();

  try {
    // Ping the Mentors table — simplest, most reliable keep-awake target
    const response = await fetch(
      `https://app.teable.io/api/table/${TEABLE_TABLE_ID_MENTORS}/record?take=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEABLE_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Cron ${timestamp}] Teable ping failed (${response.status}):`, errorText);
      return res.status(500).json({
        success: false,
        timestamp,
        error: `Teable responded with ${response.status}`,
        detail: errorText
      });
    }

    const data = await response.json();
    const recordCount = data?.records?.length ?? 0;

    console.log(`[Cron ${timestamp}] Keep-awake ping successful. Records sampled: ${recordCount}`);

    return res.status(200).json({
      success: true,
      timestamp,
      message: 'Waldorf Path database state refreshed successfully.',
      recordsSampled: recordCount
    });

  } catch (err: any) {
    console.error(`[Cron ${timestamp}] Unexpected error:`, err);
    return res.status(500).json({
      success: false,
      timestamp,
      error: err?.message || 'Internal server error'
    });
  }
}
