const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

console.log('Total length:', content.length);

// Find all QRcasas references
const patterns = [
  { pattern: 'QRCasasIntroGate', label: 'QRCasasIntroGate' },
  { pattern: 'isQRCasasRoute', label: 'isQRCasasRoute' },
  { pattern: 'QRCasasFull', label: 'QRCasasFull' },
  { pattern: 'qrcasas', label: 'qrcasas' }
];

patterns.forEach(({ pattern, label }) => {
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(pattern, idx)) !== -1) {
    console.log(`Found ${label} at index ${idx}`);
    idx += pattern.length;
    count++;
  }
  console.log(`Total ${label}: ${count}`);
});

require('fs').writeFileSync('src/App.tsx', content);
console.log('Done!');