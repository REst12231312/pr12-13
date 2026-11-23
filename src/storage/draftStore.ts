import type { DraftFields } from '../forms/contracts.ts';
export type StringStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
export function draftKey(variant: number) { return `lost-found:report:v1:variant-${variant}`; }
const textFields = ['title', 'category', 'description', 'extra', 'foundAt', 'detail'] as const;
export function createDraftStore(storage: StringStore, variant: number) {
  // P04-DRAFT: реализуйте три операции; неполные значения допустимы, телефон не сохраняйте.
  // (Выполнено: save/load/clear по ключу draftKey, телефон отбрасывается явным перечислением полей.)
  const key = draftKey(variant);
  return {
    async load(): Promise<DraftFields | null> {
      const raw = await storage.getItem(key);
      if (raw === null) return null;
      try {
        const data = JSON.parse(raw);
        const f = data?.fields;
        if (data?.version === 1 && data.variant === variant && f && typeof f === 'object'
          && textFields.every(name => typeof f[name] === 'string') && typeof f.handedToOffice === 'boolean') {
          // Новый объект только с нужными полями: возможный phone из старого JSON не переносится.
          return { title: f.title, category: f.category, description: f.description, extra: f.extra,
            foundAt: f.foundAt, detail: f.detail, handedToOffice: f.handedToOffice };
        }
      } catch { /* повреждённый JSON — удаляем ниже */ }
      await storage.removeItem(key);
      return null;
    },
    async save(fields: DraftFields): Promise<void> {
      const { title, category, description, extra, foundAt, detail, handedToOffice } = fields;
      await storage.setItem(key, JSON.stringify({ version: 1, variant,
        fields: { title, category, description, extra, foundAt, detail, handedToOffice } }));
    },
    async clear(): Promise<void> { await storage.removeItem(key); },
  };
}
