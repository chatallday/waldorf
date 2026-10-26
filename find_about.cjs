const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the about modal section
const startIdx = content.indexOf(') : policyModal === \'about\' ? (');
if (startIdx === -1) {
  console.log('START NOT FOUND');
  process.exit(1);
}

// Find the end of the about modal
const endIdx = content.indexOf('            )}', startIdx);
if (endIdx === -1) {
  console.log('END NOT FOUND');
  process.exit(1);
}

console.log('Found at:', startIdx, 'to', endIdx);
console.log('Length:', endIdx - startIdx);