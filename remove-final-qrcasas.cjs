const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the QRCasasIntroGate import (line 12)
content = content.replace(
  "const QRCasasIntroGate = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.QRCasasIntroGate })));\n",
  ''
);

// Remove the QRCasasFull lazy import
content = content.replace(
  "    const QRCasasFull = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.default })));\n",
  ''
);

fs.writeFileSync('src/App.tsx', content);
console.log('Done!');