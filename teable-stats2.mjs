const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";

async function run() {
  // Try with pageSize parameter
  const res = await fetch(`https://app.teable.ai/api/table/${tableId}/record?pageSize=200`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });
  
  const data = await res.json();
  console.log("Total records returned:", data.records?.length || 0);
  console.log("Has more:", data.hasMore);
  console.log("Total count field:", data.totalCount);
  
  if (data.records) {
    const byType = {};
    data.records.forEach(r => {
      const t = r.fields.Type || 'Unknown';
      byType[t] = (byType[t] || 0) + 1;
    });
    console.log('\nBy Type:');
    Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
    
    // Check for CLI-Hub tools
    const cliTools = data.records.filter(r => r.fields.Keywords?.includes('cli-anything') || r.fields.Name?.includes('cli-anything'));
    console.log('\nCLI-Anything tools:', cliTools.length);
    cliTools.slice(0, 10).forEach(r => console.log(`  - ${r.fields.Name} | ${r.fields.Category}`));
  }
}
run();