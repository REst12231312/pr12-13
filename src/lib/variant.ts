import chosen from '../../variant.json';
import seed from '../data/seed.json';
import type { Category, Item } from './types.ts';

export type Variant = {
  number: number;
  place: string;
  extraLabel: string;
  categories: Category[];
  items: Item[];
};

const data = seed.variants[String(chosen.variant) as keyof typeof seed.variants];

export const variant: Variant | null = data ? { number: chosen.variant, ...data, items: data.items as Item[] } : null;

export function categoryLabel(id: string): string {
  return variant?.categories.find((category) => category.id === id)?.label ?? id;
}
