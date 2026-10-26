const TEABLE_API = 'https://app.teable.ai';
const TABLE_ID = 'tblyGpv8b7UekbcTNdP';
const API_KEY = 'teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=';

fetch(`${TEABLE_API}/api/table/${TABLE_ID}/record`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
  cache: 'no-store',
})
.then(r => r.json())
.then(b => {
  const records = b.records || [];
  console.log('Total records:', records.length);
  
  // Group by type
  const byType = {};
  records.forEach(r => {
    const t = r.fields.Type || 'Unknown';
    byType[t] = (byType[t] || 0) + 1;
  });
  console.log('\nBy Type:');
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  
  // Group by category
  const byCat = {};
  records.forEach(r => {
    const c = r.fields.Category || 'Unknown';
    byCat[c] = (byCat[c] || 0) + 1;
  });
  console.log('\nTop Categories:');
  Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0,30).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  
  // Sample records
  console.log('\nSample records:');
  records.slice(0,5).forEach(r => console.log(`  - ${r.fields.Name} | ${r.fields.Type} | ${r.fields.Category}`));
})
.catch(e => console.error(e));