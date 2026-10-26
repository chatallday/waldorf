import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..', 'public', 'documents');
const OUT = join(__dirname, '..', 'src', 'data');

function extractSongs(html) {
  const songs = [];
  const songRegex = /<div class="song-item"><span class="song-dot"><\/span>(.*?)<\/div>/g;
  let m;
  while ((m = songRegex.exec(html)) !== null) {
    songs.push(m[1].trim());
  }
  return songs;
}

function extractBookItems(html) {
  const books = [];
  const bookRegex = /<div class="book-item">.*?<h4>(.*?)<\/h4>.*?<div class="meta">(.*?)<\/div>/gs;
  let m;
  while ((m = bookRegex.exec(html)) !== null) {
    books.push({ title: m[1].trim(), meta: m[2].trim() });
  }
  return books;
}

function extractCards(html) {
  const cards = [];
  const cardRegex = /<div class="card">\s*<span class="card-tag[^"]*"[^>]*>(.*?)<\/span>\s*<h3>(.*?)<\/h3>(?:\s*<div class="author">(.*?)<\/div>)?(?:\s*<p>(.*?)<\/p>)?/gs;
  let m;
  while ((m = cardRegex.exec(html)) !== null) {
    cards.push({
      tag: m[1].trim(),
      name: m[2].trim(),
      author: m[3] ? m[3].trim() : '',
      description: m[4] ? m[4].trim() : ''
    });
  }
  return cards;
}

// File 1: English directory
const eng1 = readFileSync(join(DOCS, 'waldorf_directory_english_1.html'), 'utf-8');
const eng1Data = {
  songs: extractSongs(eng1),
  books: extractBookItems(eng1),
  cards: extractCards(eng1)
};

// File 2: English directory 2
const eng2 = readFileSync(join(DOCS, 'waldorf_directory_english_2.html'), 'utf-8');
const eng2Data = {
  songs: extractSongs(eng2),
  books: extractBookItems(eng2),
  cards: extractCards(eng2)
};

// File 3: Spanish directory
const esp = readFileSync(join(DOCS, 'waldorf_directorio_espanol_1.html'), 'utf-8');
const espData = {
  songs: extractSongs(esp),
  books: extractBookItems(esp),
  cards: extractCards(esp)
};

writeFileSync(join(OUT, 'dir-english-1.json'), JSON.stringify(eng1Data, null, 2));
writeFileSync(join(OUT, 'dir-english-2.json'), JSON.stringify(eng2Data, null, 2));
writeFileSync(join(OUT, 'dir-espanol-1.json'), JSON.stringify(espData, null, 2));

console.log(`English 1: ${eng1Data.songs.length} songs, ${eng1Data.books.length} books, ${eng1Data.cards.length} cards`);
console.log(`English 2: ${eng2Data.songs.length} songs, ${eng2Data.books.length} books, ${eng2Data.cards.length} cards`);
console.log(`Spanish 1: ${espData.songs.length} songs, ${espData.books.length} books, ${espData.cards.length} cards`);
console.log('Saved to src/data/');
