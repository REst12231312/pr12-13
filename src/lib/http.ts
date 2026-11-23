import { variant, type Variant } from './variant.ts';

// Ошибка с HTTP-статусом и текстом для клиента.
export class HttpError extends Error {
  name = 'HttpError';
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Заглушка невыполненного этапа: ответ 501 с кодом этапа.
export class TodoError extends Error {
  name = 'TodoError';
  constructor(public code: string) {
    super(`TODO ${code}`);
  }
}

export function requireVariant(): Variant {
  if (!variant) throw new HttpError(500, 'Вариант не выбран: выполните npm run variant и перезапустите сервер');
  return variant;
}

// Единый формат ошибки: { error: "текст" } и подходящий статус.
export function errorResponse(error: unknown): Response {
  if (error instanceof Error && error.name === 'HttpError') {
    return Response.json({ error: error.message }, { status: (error as HttpError).status });
  }
  if (error instanceof Error && error.name === 'TodoError') {
    const code = (error as TodoError).code;
    return Response.json({ error: `Этап ${code} не выполнен`, todo: code }, { status: 501 });
  }
  console.error('[api]', error instanceof Error ? error.name : 'unknown');
  if (error instanceof Error && error.name.startsWith('Mongo')) {
    return Response.json({ error: 'База данных недоступна' }, { status: 503 });
  }
  return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
}
