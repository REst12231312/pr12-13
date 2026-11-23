import { itemStore } from '../../lib/db.ts';
import { errorResponse, requireVariant } from '../../lib/http.ts';

// Состояние сервера: вариант, хранилище и число находок в нём.
export async function GET() {
  try {
    const variant = requireVariant();
    const store = await itemStore();
    const items = await store.list({});
    return Response.json({ variant: variant.number, place: variant.place, store: store.kind, items: items.length });
  } catch (error) {
    return errorResponse(error);
  }
}
