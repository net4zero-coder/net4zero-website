import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Łączy klasy Tailwind z rozwiązywaniem konfliktów. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatuje liczbę w stylu polskim (spacje jako separator tysięcy). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL').format(value);
}

/** Formatuje kwotę w PLN. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatuje datę (pl-PL, np. "18 lip 2026"). */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** Względny czas ("2 godz. temu") — lekka implementacja bez zależności. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'lat'],
    [2592000, 'mies.'],
    [86400, 'dni'],
    [3600, 'godz.'],
    [60, 'min'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label} temu`;
  }
  return 'przed chwilą';
}

/** Rozmiar pliku w czytelnej formie. */
export function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/** Inicjały z imienia/nazwy do awatara. */
export function initials(name?: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
