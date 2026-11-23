// Единые учебные часы UTC+5 на клиенте и сервере. Настройка времени уже готова.
export function campusClock(now = new Date()) {
  const shifted = new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}
export function realDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
