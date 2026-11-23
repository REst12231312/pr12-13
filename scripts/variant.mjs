// npm run variant: выбирает случайный вариант и записывает его в variant.json.
// Повторный запуск показывает уже выбранный вариант. Другой вариант: исправьте число в variant.json (1-6).
import { randomInt } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../variant.json', import.meta.url);
const seed = JSON.parse(readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'));
let number = JSON.parse(readFileSync(file, 'utf8')).variant;

if (number >= 1 && number <= 6) {
  console.log(`Вариант уже выбран: ${number}. Чтобы сменить его, исправьте число в variant.json и перезапустите сервер.`);
} else {
  number = randomInt(1, 7);
  writeFileSync(file, JSON.stringify({ variant: number }, null, 2) + '\n');
  console.log(`Ваш вариант: ${number}. Он записан в variant.json.`);
}

const variant = seed.variants[number];
console.log(`Место: ${variant.place}`);
console.log(`Категории: ${variant.categories.map((category) => `${category.label} (${category.id})`).join(', ')}`);
console.log(`Дополнительное поле: ${variant.extraLabel}`);
