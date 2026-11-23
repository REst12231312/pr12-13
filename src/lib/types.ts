export type Category = { id: string; label: string };
export type Item = {
  _id: string; title: string; category: string; description: string;
  extra: string; foundAt: string; status: 'stored' | 'returned';
  detail?: string; handedToOffice?: boolean;
};
export type StoredItem = Item & { reporterPhone?: string };
export type ItemQuery = { q?: string; category?: string };
export interface ItemStore {
  kind: 'mongodb' | 'memory';
  list(query: ItemQuery): Promise<Item[]>;
  get(id: string): Promise<Item | null>;
  create(item: StoredItem): Promise<Item>;
}
// Явная публичная проекция: контакт не попадёт в ответ даже после смены хранилища.
export function publicItem(item: StoredItem): Item {
  return { _id: item._id, title: item.title, category: item.category,
    description: item.description, extra: item.extra, foundAt: item.foundAt,
    status: item.status, detail: item.detail, handedToOffice: item.handedToOffice };
}
