import type { UseFormSetError } from 'react-hook-form';
import type { ItemFormValues } from './itemSchema.ts';
import type { Item } from '../lib/types.ts';
import { ApiError, createItem, messageOf } from '../api/client.ts';
import { isFieldName } from './contracts.ts';
export async function submitReport(values: ItemFormValues, setError: UseFormSetError<ItemFormValues>): Promise<Item | null> {
  // P04-FORM: вызовите createItem; перенесите fieldErrors сервера через setError.
  // (Выполнено. В catch не делаем reset и не трогаем черновик — значения остаются.)
  try {
    return await createItem(values);
  } catch (error) {
    let shown = false;
    if (error instanceof ApiError) {
      for (const [name, message] of Object.entries(error.fieldErrors)) {
        if (isFieldName(name) && message) { setError(name, { type: 'server', message }); shown = true; }
      }
    }
    if (!shown) setError('root.server', { type: 'server', message: messageOf(error) });
    return null;
  }
}
