const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const URL = 'https://game8.co/games/Genshin-Impact/archives/301570';
const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const OUTPUT_FILE = path.join(ASSETS_DIR, 'game8-items.json');

function normalizeKey(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanName(name) {
  return (name || '')
    .replace(/\s+(?:Image|Icon|icon)$/i, '')
    .trim();
}

function isValidItemName(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  const blacklist = [
    'genshin impact - list of items',
    'member benefits illustration',
    'what can you do as a free member?',
    'create your free account today',
    'list of items',
  ];
  return !blacklist.some((entry) => lower.includes(entry));
}

function normalizeUrl(url) {
  if (!url) return null;
  if (url.startsWith('//')) return 'https:' + url;
  return url;
}

async function fetchHtml() {
  const response = await fetch(URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${URL}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function main() {
  const html = await fetchHtml();
  const $ = cheerio.load(html);
  const mappings = {};

  $('img').each((_, element) => {
    const imageUrl = normalizeUrl($(element).attr('data-src') || $(element).attr('src'));
    if (!imageUrl || !imageUrl.includes('img.game8.co')) return;

    let name = cleanName($(element).attr('alt') || '');
    if (!isValidItemName(name)) return;

    const key = normalizeKey(name);
    if (!key) return;

    if (!mappings[key]) {
      mappings[key] = imageUrl;
    }
  });

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  const sorted = Object.keys(mappings)
    .sort()
    .reduce((acc, key) => {
      acc[key] = mappings[key];
      return acc;
    }, {});

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`Saved ${Object.keys(sorted).length} Game8 mappings to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});