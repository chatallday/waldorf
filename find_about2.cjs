const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const startIdx = content.indexOf(') : policyModal === \'about\' ? (');
console.log('Start:', startIdx);
if (startIdx > 0) {
  let idx = startIdx;
  let depth = 0;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '(') depth++;
    else if (content[i] === ')') {
      depth--;
      if (depth === 0) {
        console.log('End at:', i);
        console.log('Context:', content.substring(i-50, i+50));
        break;
      }
    }
  }
}