import type { DraftFields } from '../forms/contracts.ts';
export type DraftPort = { save(fields: DraftFields): Promise<void>; clear(): Promise<void> };
// Эта очередь дана готовой. Очистка всегда выполняется после начавшейся записи.
export function createDraftSession(store: DraftPort, notice: (text: string) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let tail: Promise<void> = Promise.resolve();
  let pending: DraftFields | undefined;
  let generation = 0;
  function enqueue(task: () => Promise<void>) {
    const next = tail.then(task); tail = next.catch(() => {}); return next;
  }
  function cancelTimer() { if (timer) clearTimeout(timer); }
  async function flush() {
    cancelTimer();
    const fields = pending; pending = undefined;
    const current = generation;
    if (!fields) return tail;
    return enqueue(async () => {
      if (current !== generation) return;
      await store.save(fields);
      if (current === generation) notice('Черновик сохранён');
    });
  }
  return {
    schedule(fields: DraftFields) {
      cancelTimer(); pending = fields;
      timer = setTimeout(() => { void flush().catch(error => notice(error instanceof Error ? error.message : 'Черновик не сохранён')); }, 600);
    },
    cancelTimer, flush,
    async clear() {
      generation += 1; cancelTimer(); pending = undefined;
      await enqueue(() => store.clear());
    },
  };
}
