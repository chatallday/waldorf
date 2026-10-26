const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the DEFAULT_ABOUT constant - missing closing backtick
// The issue is the template literal is missing its closing backtick before the semicolon
content = content.replace(
  'DEFAULT_ABOUT = `About Us\\n\\nThe Waldorf Path was woven together by three women — Romy, a certified early-childhood Waldorf educator; Elody, a soon-to-be Waldorf handwork teacher; and Nina, a mother whose three children grew up in the warmth of the Waldorf home and school. We come from different paths and different places, but we cherish the same deep conviction: that the wisdom living in Waldorf education deserves to be found, loved, and carried forward by as many families as possible.\\n\\nOur Mission\\nThe Directory is our gift to your Waldorf path.\`;',
  'DEFAULT_ABOUT = `About Us\\n\\nThe Waldorf Path was woven together by three women — Romy, a certified early-childhood Waldorf educator; Elody, a soon-to-be Waldorf handwork teacher; and Nina, a mother whose three children grew up in the warmth of the Waldorf home and school. We come from different paths and different places, but we cherish the same deep conviction: that the wisdom living in Waldorf education deserves to be found, loved, and carried forward by as many families as possible.\\n\\nOur Mission\\nThe Directory is our gift to your Waldorf path.`;'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed!');