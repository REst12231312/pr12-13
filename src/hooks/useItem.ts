import { useEffect, useState } from 'react';
import { ApiError, getItem, messageOf } from '../api/client.ts';
import type { Item } from '../lib/types.ts';

export type DetailState =
  | { status: 'loading' }
  | { status: 'ready'; item: Item }
  | { status: 'not-found' }
  | { status: 'error'; message: string; todo?: string };

export function useItem(id: string): { state: DetailState; retry: () => void } {
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getItem(id)
      .then(({ item }) => active && setState({ status: 'ready', item }))
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) setState({ status: 'not-found' });
        else setState({ status: 'error', message: messageOf(error), todo: error instanceof ApiError ? error.todo : undefined });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  return { state, retry: () => setAttempt((count) => count + 1) };
}
