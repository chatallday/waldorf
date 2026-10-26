import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..', 'public', 'documents');

function extractLinkListEntries(html, section) {
  const entries = [];
  const llRegex = /<li>\s*<span class="ll-name">(.*?)<\/span>\s*<span class="ll-detail">(.*?)<\/span>\s*<span class="ll-url">(.*?)<\/span>\s*<\/li>/gs;
  let m;
  while ((m = llRegex.exec(html)) !== null) {
    entries.push({
      name: m[1].trim(),
      detail: m[2].trim(),
      url: m[3].trim(),
      section
    });
  }
  return entries;
}

function extractEntryCards(html, section) {
  const entries = [];
  const entryRegex = /<div class="entry">\s*<div class="entry-name">(.*?)<\/div>\s*<div class="entry-sub">(.*?)<\/div>(?:\s*<span class="entry-tag[^"]*"[^>]*>(.*?)<\/span>)?/gs;
  let m;
  while ((m = entryRegex.exec(html)) !== null) {
    entries.push({
      name: m[1].trim(),
      description: m[2].trim(),
      tag: m[3] ? m[3].trim() : '',
      section
    });
  }
  return entries;
}

function getSectionName(html, startPos) {
  const before = html.substring(0, startPos);
  const sectionRegex = /<div class="subsection-title"[^>]*>(.*?)<\/div>/gi;
  let lastSection = '';
  let m;
  while ((m = sectionRegex.exec(before)) !== null) {
    lastSection = m[1].trim();
  }
  const mainSectionRegex = /<div class="section-title"[^>]*>(.*?)<\/div>/gi;
  let lastMain = '';
  while ((m = mainSectionRegex.exec(before)) !== null) {
    lastMain = m[1].trim();
  }
  return lastMain ? `${lastMain} > ${lastSection}` : lastSection;
}

const html = readFileSync(join(DOCS, 'the_waldorf_path_directory.html'), 'utf-8');
const sections = html.split(/(?=<div class="section[^"]*"[^>]*>)/);
let allEntries = [];
let allCards = [];

for (const sectionHtml of sections) {
  if (!sectionHtml.includes('ll-name') && !sectionHtml.includes('entry-name')) continue;
  const sectionName = sectionHtml.match(/id="([^"]+)"/)?.[1] || 'unknown';
  const entries = extractLinkListEntries(sectionHtml, sectionName);
  const cards = extractEntryCards(sectionHtml, sectionName);
  allEntries = allEntries.concat(entries);
  allCards = allCards.concat(cards);
}

writeFileSync(join(__dirname, '..', 'src', 'data', 'directory-extracted-linklist.json'), JSON.stringify(allEntries, null, 2));
writeFileSync(join(__dirname, '..', 'src', 'data', 'directory-extracted-cards.json'), JSON.stringify(allCards, null, 2));

console.log(`Extracted ${allEntries.length} link-list entries and ${allCards.length} entry cards`);
console.log('Saved to src/data/directory-extracted-linklist.json and directory-extracted-cards.json');
