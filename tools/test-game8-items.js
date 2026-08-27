const fs = require('fs');
const path = require('path');

function normalizeKey(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const filePath = path.join(__dirname, '..', 'public', 'assets', 'game8-items.json');
if (!fs.existsSync(filePath)) {
  console.error('Missing file:', filePath);
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const keys = Object.keys(map);
console.log(`Loaded ${keys.length} entries from ${path.relative(process.cwd(), filePath)}`);

const samples = [
  'Adventurer',
  'Hero',
  'Agnidus Agate Sliver',
  'Agnidus Agate Gemstone',
  'Vajrada Amethyst Chunk',
  'Book of Freedom',
  'Mora',
];

for (const name of samples) {
  const key = normalizeKey(name);
  console.log(name.padEnd(30), '=>', key.padEnd(40), '=>', map[key] || '[missing]');
}

if (keys.length === 0) {
  console.error('No mappings found.');
  process.exit(1);
}
