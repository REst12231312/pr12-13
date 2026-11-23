import { phoneSchema } from '../forms/itemSchema.ts';
export const PHONE_KEY = 'lost-found-reporter-phone-v1';
export type SecurePort = {
  available(): Promise<boolean>; get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>; remove(key: string): Promise<void>;
};
export function createPhoneStore(port: SecurePort) {
  // P04-CONTACT: загрузка, явное сохранение и удаление через готовый адаптер SecureStore.
  // (Выполнено: телефон хранится только в SecureStore, отдельно от черновика.)
  return {
    async load(): Promise<string | null> {
      if (!(await port.available())) return null;
      const value = await port.get(PHONE_KEY);
      if (value === null) return null;
      const parsed = phoneSchema.safeParse(value);
      if (parsed.success) return parsed.data;
      await port.remove(PHONE_KEY); // неподходящий номер удаляем
      return null;
    },
    async save(phone: string): Promise<void> {
      const parsed = phoneSchema.safeParse(phone);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      if (!(await port.available())) throw new Error('Номер не сохранён: защищённое хранилище недоступно на этом устройстве');
      await port.set(PHONE_KEY, parsed.data);
    },
    async clear(): Promise<void> {
      if (await port.available()) await port.remove(PHONE_KEY);
    },
  };
}
