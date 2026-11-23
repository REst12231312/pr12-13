import { useCallback, useEffect, useState } from 'react';
import { ApiError, getItems, messageOf } from '../api/client.ts';
import type { Item, ItemQuery } from '../lib/types.ts';

export type ListState =
  | { status: 'loading' }
  | { status: 'ready'; items: Item[]; q: string }
  | { status: 'error'; message: string; todo?: string };

function errorState(error: unknown): ListState {
  return { status: 'error', message: messageOf(error), todo: error instanceof ApiError ? error.todo : undefined };
}

export function useItems(query: ItemQuery): { state: ListState; retry: () => void; todo?: string } {
  const [state, setState] = useState<ListState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  // P03-STALE
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getItems(query, controller.signal)
      .then(({ items }) => setState({ status: 'ready', items, q: query.q ?? '' }))
      .catch((error) => {
        if (!controller.signal.aborted) setState(errorState(error));
      });
    return () => controller.abort();
  }, [query.q, query.category, attempt]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);
  return { state, retry };
}
