import type { FieldErrors } from '../forms/contracts.ts';
import type { ItemFormValues } from '../forms/itemSchema.ts';
import type { Item, ItemQuery } from '../lib/types.ts';

export class ApiError extends Error {
  name = 'ApiError';
  constructor(public status: number, message: string, public todo?: string, public fieldErrors: FieldErrors = {}) {
    super(message);
  }
}

// Относительный адрес: запрос уходит на тот же сервер разработки, что отдал приложение.
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0, 'Нет связи с сервером');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body?.error ?? `Ошибка ${response.status}`, body?.todo);
  return body as T;
}

// Учебная задержка: ответ на запрос из одной буквы приходит на 1,5 с позже.
function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

export async function getItems(query: ItemQuery, signal?: AbortSignal) {
  console.log(`[api] запрос q="${query.q ?? ''}"`);
  await pause(query.q?.length === 1 ? 1500 : 0, signal);
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  const body = await request<{ items: Item[]; store: string }>(`/api/items?${params}`, signal);
  console.log(`[api] ответ q="${query.q ?? ''}": ${body.items.length} шт.`);
  return body;
}

export function getItem(id: string, signal?: AbortSignal) {
  return request<{ item: Item; store: string }>(`/api/items/${encodeURIComponent(id)}`, signal);
}

export function getHealth(signal?: AbortSignal) {
  return request<{ variant: number; place: string; store: string; items: number }>('/api/health', signal);
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Сеть недоступна';
}


export async function createItem(values: ItemFormValues): Promise<Item> {
  let response: Response;
  try {
    response = await fetch('/api/items', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
    });
  } catch { throw new ApiError(0, 'Нет связи с сервером. Поля и черновик сохранены.'); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body?.error ?? 'Ошибка отправки', body?.todo, body?.fieldErrors ?? {});
  if (!body?.item?._id) throw new ApiError(502, 'Сервер не вернул созданную находку');
  return body.item as Item;
}
