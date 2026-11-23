import { randomUUID } from 'node:crypto';
import { createItemSchema } from '../../forms/itemSchema.ts';
import { fieldErrors } from '../../forms/contracts.ts';
import { itemStore } from '../../lib/db.ts';
import { errorResponse, HttpError, requireVariant } from '../../lib/http.ts';

// P03-API: GET /api/items?q=...&category=...
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const category = url.searchParams.get('category') ?? '';
    if (q.length > 50) throw new HttpError(400, 'Запрос длиннее 50 символов');
    if (category && !requireVariant().categories.some((known) => known.id === category)) {
      throw new HttpError(400, `Неизвестная категория: ${category}`);
    }
    const store = await itemStore();
    const items = await store.list({ q: q || undefined, category: category || undefined });
    return Response.json({ items, store: store.kind });
  } catch (error) {
    return errorResponse(error);
  }
}


// P04-SERVER: JSON -> schema.safeParse -> 400 fieldErrors или create и 201.
// (Выполнено: лимит 8192 -> 413, битый JSON -> 400, safeParse -> 400 fieldErrors, иначе create -> 201.)
export async function POST(request: Request) {
  try {
    const config = requireVariant();
    const text = await request.text();
    if (text.length > 8192) throw new HttpError(413, 'Заявка слишком большая');
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Тело запроса не является корректным JSON'); }
    const result = createItemSchema(config).safeParse(body);
    if (!result.success) {
      return Response.json({ error: 'Проверьте поля заявки', fieldErrors: fieldErrors(result.error.issues) }, { status: 400 });
    }
    // Телефон отделяем от публичных полей: он хранится только в закрытом reporterPhone.
    const { phone, ...fields } = result.data;
    const store = await itemStore();
    const item = await store.create({ ...fields, _id: 'F-' + randomUUID(), status: 'stored', reporterPhone: phone });
    return Response.json({ item, store: store.kind }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
