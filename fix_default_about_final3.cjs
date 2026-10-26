const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = 'DEFAULT_ABOUT = `About Us\\n\\nThe Waldorf Path was woven together by three women — Romy, a certified early-childhood Waldorf educator; Elody, a soon-to-be Waldorf handwork teacher; and Nina, a mother whose three children grew up in the warmth of the Waldorf home and school. We come from different paths and different places, but we cherish the same deep conviction: that the wisdom living in Waldorf education deserves to be found, loved, and carried forward by as many families as possible.\\n\\nOur Mission\\nThe Directory is our gift to your Waldorf path.\`;';

const newStr = 'DEFAULT_ABOUT = `About Us\\n\\nThe Waldorf Path was woven together by three women — Romy, a certified early-childhood Waldorf educator; Elody, a soon-to-be Waldorf handwork teacher; and Nina, a mother whose three children grew up in the warmth of the Waldorf home and school. We come from different paths and different places, but we cherish the same deep conviction: that the wisdom living in Waldorf education deserves to be found, loved, and carried forward by as many families as possible.\\n\\nOur Mission\\nThe Directory is our gift to your Waldorf path.\`;';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Replaced!');
} else {
  console.log('NOT FOUND');
  const idx = content.indexOf('DEFAULT_ABOUT');
  if (idx > 0) {
    console.log('Found at:', idx);
    console.log(JSON.stringify(content.substring(idx, idx + 200)));
  }
}