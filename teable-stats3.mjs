const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";

async function run() {
  // Try with viewId or pagination
  let allRecords = [];
  let cursor = null;
  let page = 0;
  
  do {
    page++;
    let url = `https://app.teable.ai/api/table/${tableId}/record?pageSize=200`;
    if (cursor) url += `&cursor=${cursor}`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    
    const data = await res.json();
    console.log(`Page ${page}: ${data.records?.length || 0} records, hasMore: ${data.hasMore}, cursor: ${data.cursor}`);
    
    if (data.records) {
      allRecords = allRecords.concat(data.records);
    }
    cursor = data.cursor;
  } while (cursor && page < 10);
  
  console.log(`\nTotal collected: ${allRecords.length}`);
  
  const byType = {};
  allRecords.forEach(r => {
    const t = r.fields.Type || 'Unknown';
    byType[t] = (byType[t] || 0) + 1;
  });
  console.log('\nBy Type:');
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  
  const cliTools = allRecords.filter(r => r.fields.Keywords?.includes('cli-anything') || r.fields.Name?.toLowerCase().includes('cli'));
  console.log('\nCLI-Anything tools:', cliTools.length);
  cliTools.slice(0, 20).forEach(r => console.log(`  - ${r.fields.Name} | ${r.fields.Category}`));
}
run();