import { z } from 'zod';
import type { Variant } from '../lib/variant.ts';
import { campusClock, realDate } from '../lib/clock.ts';
export const phoneSchema = z.string().trim().regex(/^\+7\d{10}$/, 'Введите телефон: +7 и ещё 10 цифр');
// Пустые строки допустимы в черновике; проверка отправки строже.
export const emptyForm = (config: Variant) => ({
  title: '', category: config.categories[0].id, description: '', extra: '',
  foundAt: campusClock().date, detail: '', phone: '', handedToOffice: false,
});
export function createItemSchema(config: Variant, now = new Date()) {
  // P04-SCHEMA: дополните общие правила и правило своего варианта.
  // Название показано как готовый пример. (Выполнено: общие правила + правила вариантов 1-6 в superRefine.)
  const today = campusClock(now).date;
  const categoryIds = config.categories.map(c => c.id);
  // Описание: от 5 до 500 символов; для gadgets варианта 3 — не менее 10.
  const minDescription = config.number === 3 ? 10 : 5;
  return z.strictObject({
    title: z.string().trim().min(3, 'Название: от 3 символов').max(80, 'Название: до 80 символов'),
    // Только ID категорий выбранного варианта, произвольное название не принимается.
    category: z.string().refine(id => categoryIds.includes(id), 'Выберите категорию из списка'),
    description: z.string().trim()
      .min(5, 'Описание: от 5 символов').max(500, 'Описание: до 500 символов'),
    extra: z.string().trim()
      .min(1, `${config.extraLabel}: обязательное поле`).max(80, `${config.extraLabel}: до 80 символов`),
    // Дата: настоящая (realDate), не раньше 2000-01-01 и не позже сегодняшней по часам UTC+5.
    foundAt: z.string().trim().superRefine((value, ctx) => {
      if (!realDate(value)) ctx.addIssue({ code: 'custom', message: 'Дата: существующая дата в формате ГГГГ-ММ-ДД' });
      else if (value < '2000-01-01') ctx.addIssue({ code: 'custom', message: 'Дата: не раньше 2000-01-01' });
      else if (value > today) ctx.addIssue({ code: 'custom', message: 'Дата: не позже сегодняшней' });
    }),
    detail: z.string().trim().max(80, 'Уточнение: до 80 символов'),
    phone: phoneSchema,
    handedToOffice: z.boolean(),
  }).superRefine((value, ctx) => {
    // Правило своего варианта (выбирается по config.number).
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    const category = value.category;
    if (config.number === 1 && category === 'keys' && !/^\d{3}$/.test(value.extra.trim())) {
      issue('extra', 'Комната: ровно 3 цифры');
    }
    if (config.number === 2 && category === 'books' && value.detail.trim().length < 3) {
      issue('detail', 'Инвентарный номер: от 3 символов');
    }
    if (config.number === 3 && category === 'gadgets' && value.description.trim().length < 10) {
      issue('description', 'Описание гаджета: от 10 символов');
    }
    if (config.number === 4) {
      const time = value.extra.trim();
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) issue('extra', 'Время: формат ЧЧ:ММ, например 12:30');
      else if (value.foundAt.trim() === today && time > campusClock(now).time) {
        issue('extra', 'Время: для сегодняшней даты не позже текущего');
      }
    }
    if (config.number === 5 && category === 'electronics' && value.detail.trim().length < 2) {
      issue('detail', 'Цвет или модель: от 2 символов');
    }
    if (config.number === 6 && category === 'documents' && !value.handedToOffice) {
      issue('handedToOffice', 'Подтвердите, что документы переданы в деканат');
    }
  });
}

export type ItemFormValues = z.infer<ReturnType<typeof createItemSchema>>;
