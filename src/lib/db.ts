import { MongoClient, type Filter } from 'mongodb';
import { requireVariant, TodoError } from './http.ts';
import { memoryStore } from './memoryStore.ts';
import { publicItem, type ItemStore, type StoredItem } from './types.ts';

const uri = process.env.MONGODB_URI;

// Сервер разработки заново выполняет этот модуль на каждый запрос.
// Клиент MongoDB хранится в globalThis, чтобы не открывать новые подключения.
const shared = globalThis as typeof globalThis & { lostFoundClient?: MongoClient };

// Символы регулярного выражения из запроса ищутся буквально.
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function itemStore(): Promise<ItemStore> {
  const variant = requireVariant();
  if (!uri) return memoryStore(variant.items, variant.number);

  // P03-ATLAS
  const client = (shared.lostFoundClient ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }));
  const items = client.db('lostfound').collection<StoredItem>('items');
  return {
    kind: 'mongodb',
    list({ q, category }) {
      const filter: Filter<StoredItem> = {};
      if (category) filter.category = category;
      if (q) {
        const pattern = { $regex: escapeRegex(q), $options: 'i' };
        filter.$or = [{ title: pattern }, { description: pattern }];
      }
      return items.find(filter).sort({ foundAt: -1, _id: 1 }).toArray().then(rows => rows.map(publicItem));
    },
    async get(id) {
      const item = await items.findOne({ _id: id });
      return item ? publicItem(item) : null;
    },
    async create(item) {
      await items.insertOne(item);
      return publicItem(item);
    },
  };
}
