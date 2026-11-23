import type { z } from 'zod';
import type { ItemFormValues } from './itemSchema.ts';
export const fieldNames = ['title','category','description','extra','foundAt','detail','phone','handedToOffice'] as const;
export type FieldName = typeof fieldNames[number];
export type FieldErrors = Partial<Record<FieldName, string>>;
export function isFieldName(name: string): name is FieldName { return (fieldNames as readonly string[]).includes(name); }
export function fieldErrors(issues: z.core.$ZodIssue[]): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && isFieldName(key) && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}
export type DraftFields = Omit<ItemFormValues, 'phone'>;
export function draftFields(values: ItemFormValues): DraftFields {
  const { title,category,description,extra,foundAt,detail,handedToOffice } = values;
  return { title,category,description,extra,foundAt,detail,handedToOffice };
}
export function meaningful(fields: DraftFields): boolean {
  return Boolean(fields.title || fields.description || fields.extra || fields.detail || fields.handedToOffice);
}
