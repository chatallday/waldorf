#!/usr/bin/env node
// QRcasas 5-shot hero pipeline — free Pollinations + FrameOS ready
// Usage: node scripts/generate-qrcasas-shots.mjs
// Outputs: public/qrcasas/shots/*.jpg + public/qrcasas/shots/manifest.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/qrcasas/shots');

const SHOTS = [
  { id: '01-the-question', prompt: "Photorealistic cinematic luxury apartment in Playa del Carmen, Quintana Roo, Mexico, early morning. Camera behind an adult resident as they slowly slide open enormous glass balcony doors. Warm Caribbean sunlight floods interior. Lush tropical vegetation and palm trees visible beyond balcony. Natural architecture, sophisticated but lived-in, authentic Mexican Caribbean environment. Slow smooth dolly forward, shallow depth of field, realistic natural lighting, premium architectural cinematography, subtle film grain, no text, no logos.", w: 1920, h: 1080 },
  { id: '02-the-life', prompt: "Photorealistic cinematic lifestyle footage in Playa del Carmen, Quintana Roo, Mexico. An attractive adult couple casually cycling together through a leafy residential neighbourhood, passing small cafés and tropical vegetation. They look relaxed and genuinely local, not tourists. Natural everyday clothing, realistic Mexican Caribbean streetscape, warm late-afternoon sunlight. Smooth side-tracking camera movement, shallow depth of field, premium travel-film cinematography, realistic human movement, no text, no logos.", w: 1920, h: 1080 },
  { id: '03-the-choice', prompt: "Photorealistic cinematic scene at a sophisticated but relaxed outdoor restaurant in Playa del Carmen, Quintana Roo. The same adult couple sitting together at a small table, naturally laughing and talking while a waiter places drinks on the table. Lush tropical plants, warm ambient light, authentic local atmosphere, international community feeling, elegant but not extravagant. Slow subtle camera movement, shallow depth of field, realistic skin and human motion, cinematic luxury lifestyle photography, no text, no logos.", w: 1920, h: 1080 },
  { id: '04-the-contrast', prompt: "Photorealistic cinematic evening scene in a quiet residential neighbourhood in Playa del Carmen, Quintana Roo. Tropical trees and palms, warm architectural lighting, very little traffic. An adult couple casually walking home together. Peaceful, safe, intimate atmosphere. Slow forward tracking camera, cinematic depth of field, realistic lighting, premium lifestyle film, no tourists, no text, no logos.", w: 1920, h: 1080 },
  { id: '05-the-home', prompt: "Photorealistic cinematic interior of a beautiful modern apartment in Playa del Carmen, Quintana Roo at golden hour. Large open balcony doors, lush garden and swimming pool visible below. An adult resident sits comfortably with a coffee enjoying the view. The apartment feels private, peaceful and genuinely lived-in. Camera slowly pulls backwards. Warm natural sunlight, sophisticated architectural cinematography, realistic materials, subtle film grain, no text, no logos.", w: 1920, h: 1080 },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`→ Generating ${SHOTS.length} shots → ${OUT_DIR} (Pollinations flux, free)`);
  const manifest = [];
  for (const shot of SHOTS) {
    const enc = encodeURIComponent(shot.prompt);
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://image.pollinations.ai/prompt/${enc}?model=flux&width=${shot.w}&height=${shot.h}&seed=${seed}&nologo=true`;
    const outPath = path.join(OUT_DIR, `${shot.id}.jpg`);
    console.log(`  • ${shot.id} → fetching…`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      console.log(`    ✓ ${shot.id}.jpg (${(buf.length/1024).toFixed(1)} KB)`);
      manifest.push({ ...shot, url, file: `qrcasas/shots/${shot.id}.jpg`, seed, generatedAt: new Date().toISOString() });
    } catch (e) {
      console.error(`    ✗ ${shot.id} failed:`, e.message);
      manifest.push({ ...shot, url, file: null, error: e.message });
    }
    await new Promise(r => setTimeout(r, 1200)); // be nice to API
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), shots: manifest }, null, 2));
  console.log(`\nDone. Manifest: ${path.join(OUT_DIR, 'manifest.json')}`);
  console.log(`Next: Copy stills to FrameOS as reference, or stitch to MP4 via F:\\Mike d drive\\…\\Higgsfield-Alternative-github (CinematicStudio)`);
}

main().catch(e => { console.error(e); process.exit(1); });
