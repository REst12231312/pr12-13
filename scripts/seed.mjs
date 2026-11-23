// npm run seed: записывает находки своего варианта в MongoDB (база lostfound, коллекция items).
// Строка подключения берётся из .env.local. Повторный запуск заменяет данные заново.
import { existsSync, readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const env = new URL('../.env.local', import.meta.url);
if (existsSync(env)) process.loadEnvFile(env);
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI не задан. Создайте в корне проекта файл .env.local со строкой MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

const number = JSON.parse(readFileSync(new URL('../variant.json', import.meta.url), 'utf8')).variant;
const variant = JSON.parse(readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8')).variants[number];
if (!variant) {
  console.error('Вариант не выбран: выполните npm run variant.');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  const items = client.db('lostfound').collection('items');
  await items.deleteMany({});
  const result = await items.insertMany(variant.items);
  console.log(`Готово: ${result.insertedCount} находок варианта ${number} (${variant.place}) в lostfound.items.`);
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  if (/auth/i.test(error.message)) console.error('Проверьте имя и пароль пользователя базы данных в строке подключения.');
  else console.error('Проверьте Network Access в Atlas (разрешён ли ваш IP-адрес) и подключение к интернету.');
  process.exitCode = 1;
} finally {
  await client.close();
}
