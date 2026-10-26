const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove QRCasasIntroGate lazy import
content = content.replace(
  "const QRCasasIntroGate = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.QRCasasIntroGate })));\n",
  ''
);

// 2. Remove the isQRCasasRoute check and QRCasasFull rendering
const qrcasasRouteCode = `  const isQRCasasRoute = typeof window !== 'undefined' && (window.location.pathname === '/qrcasas' || window.location.pathname === '/qrcasas/' || new URLSearchParams(window.location.search).get('view') === 'qrcasas');

  if (isQRCasasRoute) {
    const QRCasasFull = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.default })));

      <React.Suspense fallback={<div className="min-h-screen bg-[#080c0b] grid place-items-center text-white/40 font-mono text-xs tracking-widest">QRcasas \u2014 Loading film.</div>}>
        <QRCasasFull onEnter={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate')); window.location.reload(); }} onDismissForever={() => { try { localStorage.setItem('qrcasas_intro_dismissed','1'); localStorage.setItem('qrcasas_intro_dont_show','1'); } catch {}; window.history.pushState({}, '', '/'); window.location.reload(); }} onClose={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />
  }`;

content = content.replace(qrcasasRouteCode, '');

// 3. Remove the QRCasasIntroGate opening tag
content = content.replace('      <QRCasasIntroGate>\n', '');

// 4. Remove the QRcasas button in the footer
content = content.replace('            <button onClick={() => window.dispatchEvent(new CustomEvent(\'qrcasas:show-intro\'))} className="hover:text-sage transition-colors cursor-pointer font-bold border-none bg-transparent flex items-center gap-1 text-[#c8a96a]">? QRcasas Cinematic Intro</button>\n', '');

// 5. Remove the closing QRCasasIntroGate tag
content = content.replace('      </QRCasasIntroGate>\n', '');

fs.writeFileSync('src/App.tsx', content);
console.log('Done!');