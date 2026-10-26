// publish-seasonal.js - Daily rhythm publisher
// Uses native fetch (Node 18+) - no external deps needed

async function publishDailyRhythm() {
  const teableApiKey = process.env.TEABLE_API_KEY;
  if (!teableApiKey) {
    console.error('Missing TEABLE_API_KEY');
    process.exit(1);
  }

  // Fetch rhythms from Teable
  const res = await fetch('https://app.teable.ai/api/table/tblyhpS9TM2TMKOGU8B/record', {
    headers: { Authorization: `Bearer ${teableApiKey}` }
  });
  const data = await res.json();
  
  // Find today's match or default to first record
  const today = new Date().toISOString().split('T')[0];
  const record = data.records?.find(r => r.fields.Date === today) || data.records?.[0];

  if (record) {
    const payload = {
      date: today,
      season: record.fields.Season || 'Spring',
      verse: record.fields.Verse || '',
      colour: record.fields.Colour || '',
      grain: record.fields.Grain || '',
      activity: record.fields.Activity || '',
      planet: record.fields.Planet || '',
      imageUrl: record.fields.Image_URL || ''
    };
    fs.writeFileSync('public/daily-rhythm.json', JSON.stringify(payload, null, 2));
    console.log('Successfully published daily rhythm for', today);
  }
}

publishDailyRhythm();