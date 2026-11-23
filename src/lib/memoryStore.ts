import { publicItem, type Item, type ItemStore, type StoredItem } from './types.ts';
type Memory = { variant: number; items: StoredItem[] };
const shared = globalThis as typeof globalThis & { lostFoundP04?: Memory };
// Metro повторно выполняет API-модули. Состояние хранится в globalThis до перезапуска.
export function memoryStore(seed: Item[], variantNumber: number): ItemStore {
  if (shared.lostFoundP04?.variant !== variantNumber) {
    shared.lostFoundP04 = { variant: variantNumber, items: seed.map(item => ({ ...item })) };
  }
  const items = shared.lostFoundP04!.items;
  return {
    kind: 'memory',
    async list({ q, category }) {
      const needle = q?.toLocaleLowerCase('ru');
      return items.filter(item => !category || item.category === category)
        .filter(item => !needle || item.title.toLocaleLowerCase('ru').includes(needle)
          || item.description.toLocaleLowerCase('ru').includes(needle))
        .sort((a,b) => b.foundAt.localeCompare(a.foundAt) || a._id.localeCompare(b._id))
        .map(publicItem);
    },
    async get(id) { const item = items.find(item => item._id === id); return item ? publicItem(item) : null; },
    async create(item) { items.push({ ...item }); return publicItem(item); },
  };
}
