import { format } from 'date-fns';

let dailyCounter: Record<string, number> = {};

export function generateOrderId(): string {
  const today = format(new Date(), 'yyyyMMdd');
  if (!dailyCounter[today]) {
    dailyCounter[today] = 0;
  }
  dailyCounter[today]++;
  const seq = String(dailyCounter[today]).padStart(4, '0');
  return `PED-${today}-${seq}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
