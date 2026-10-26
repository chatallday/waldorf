const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove QRCasasIntroGate lazy import
const importIdx = content.indexOf("const QRCasasIntroGate = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.QRCasasIntroGate })));\n");
if (importIdx !== -1) {
  content = content.slice(0, importIdx) + content.slice(importIdx + "const QRCasasIntroGate = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.QRCasasIntroGate })));\n".length);
  console.log('Removed QRCasasIntroGate import');
} else {
  console.log('QRCasasIntroGate import not found at expected location');
}

// 2. Remove the QRcasas route code
const routeStart = content.indexOf("  const isQRCasasRoute = typeof window !== 'undefined' && (window.location.pathname === '/qrcasas' || window.location.pathname === '/qrcasas/' || new URLSearchParams(window.location.search).get('view') === 'qrcasas');\n\n  if (isQRCasasRoute) {\n    const QRCasasFull = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.default })));\n\n      <React.Suspense fallback={<div className=\"min-h-screen bg-[#080c0b] grid place-items-center text-white/40 font-mono text-xs tracking-widest\">QRcasas \u2014 Loading film.</div>}>\n        <QRCasasFull onEnter={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate')); window.location.reload(); }} onDismissForever={() => { try { localStorage.setItem('qrcasas_intro_dismissed','1'); localStorage.setItem('qrcasas_intro_dont_show','1'); } catch {}; window.history.pushState({}, '', '/'); window.location.reload(); }} onClose={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />\n  }");

if (routeStart !== -1) {
  const routeEnd = routeStart + "  const isQRCasasRoute = typeof window !== 'undefined' && (window.location.pathname === '/qrcasas' || window.location.pathname === '/qrcasas/' || new URLSearchParams(window.location.search).get('view') === 'qrcasas');\n\n  if (isQRCasasRoute) {\n    const QRCasasFull = React.lazy(() => import('./components/QRCasasCinematic').then(m => ({ default: m.default })));\n\n      <React.Suspense fallback={<div className=\"min-h-screen bg-[#080c0b] grid place-items-center text-white/40 font-mono text-xs tracking-widest\">QRcasas \u2014 Loading film.</div>}>\n        <QRCasasFull onEnter={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate')); window.location.reload(); }} onDismissForever={() => { try { localStorage.setItem('qrcasas_intro_dismissed','1'); localStorage.setItem('qrcasas_intro_dont_show','1'); } catch {}; window.history.pushState({}, '', '/'); window.location.reload(); }} onClose={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />\n  }".length;
  content = content.slice(0, routeStart) + content.slice(routeStart + routeEnd);
  console.log('Removed QRcasas route code');
} else {
  console.log('QRcasas route code not found');
}

// Remove the QRCasasIntroGate opening tag
const openTagIdx = content.indexOf('      <QRCasasIntroGate>\n');
if (openTagIdx !== -1) {
  content = content.slice(0, openTagIdx) + content.slice(openTagIdx + '      <QRCasasIntroGate>\n'.length);
  console.log('Removed QRCasasIntroGate opening tag');
} else {
  console.log('QRCasasIntroGate opening tag not found');
}

// Remove the QRcasas button in the footer
const buttonIdx = content.indexOf('            <button onClick={() => window.dispatchEvent(new CustomEvent(\'qrcasas:show-intro\'))} className="hover:text-sage transition-colors cursor-pointer font-bold border-none bg-transparent flex items-center gap-1 text-[#c8a96a]">? QRcasas Cinematic Intro</button>\n');
if (buttonIdx !== -1) {
  content = content.slice(0, buttonIdx) + content.slice(buttonIdx + '            <button onClick={() => window.dispatchEvent(new CustomEvent(\'qrcasas:show-intro\'))} className="hover:text-sage transition-colors cursor-pointer font-bold border-none bg-transparent flex items-center gap-1 text-[#c8a96a]">? QRcasas Cinematic Intro</button>\n'.length);
  console.log('Removed QRcasas button');
} else {
  console.log('QRcasas button not found');
}

// Remove the closing QRCasasIntroGate tag
const closeTagIdx = content.indexOf('      </QRCasasIntroGate>\n');
if (closeTagIdx !== -1) {
  content = content.slice(0, closeTagIdx) + content.slice(closeTagIdx + '      </QRCasasIntroGate>\n'.length);
  console.log('Removed QRCasasIntroGate closing tag');
} else {
  console.log('QRCasasIntroGate closing tag not found');
}

require('fs').writeFileSync('src/App.tsx', content);
console.log('Done!');