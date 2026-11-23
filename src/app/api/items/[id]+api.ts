import { itemStore } from '../../../lib/db.ts';
import { errorResponse, HttpError } from '../../../lib/http.ts';

// P03-API: GET /api/items/D-101
export async function GET(_request: Request, { id }: Record<string, string>) {
  try {
    const store = await itemStore();
    const item = await store.get(id);
    if (!item) throw new HttpError(404, 'Находка не найдена');
    return Response.json({ item, store: store.kind });
  } catch (error) {
    return errorResponse(error);
  }
}
