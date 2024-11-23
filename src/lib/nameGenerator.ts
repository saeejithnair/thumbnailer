// Adjectives and nouns for generating readable IDs
const adjectives = [
  'cosmic', 'mystic', 'azure', 'golden', 'crystal', 'ember', 'lunar', 'solar',
  'astral', 'radiant', 'shadow', 'storm', 'dream', 'frost', 'flame', 'ocean'
];

const nouns = [
  'phoenix', 'dragon', 'lotus', 'prism', 'nebula', 'aurora', 'comet', 'star',
  'moon', 'sun', 'wave', 'cloud', 'leaf', 'gem', 'rose', 'wind'
];

export function generateReadableId(index: number = 0): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const uniqueSuffix = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${uniqueSuffix}`;
}