const TEABLE_API = 'https://app.teable.ai';
const TABLE_ID = 'tblyGpv8b7UekbcTNdP';
const API_KEY = 'teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=';

fetch(`${TEABLE_API}/api/table/${TABLE_ID}/record`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
  cache: 'no-store',
})
.then(r => r.json())
.then(b => {
  console.log('Records:', (b.records || []).length);
  (b.records || []).slice(0, 3).forEach(r => console.log(' -', r.fields.Name, '|', r.fields.Type, '|', r.fields.Category));
})
.catch(e => console.error(e));