import type { LocationStatus, LocationType, Role, TaskStatus, TaskPriority } from '@prisma/client';

/**
 * Kolory i etykiety statusów lokalizacji — jedyne źródło prawdy używane
 * przez markery na mapie, badge'e i legendy.
 */
export const STATUS_META: Record<
  LocationStatus,
  { label: string; color: string; textClass: string; bgClass: string }
> = {
  SIGNED: {
    label: 'Podpisana',
    color: '#16a34a',
    textClass: 'text-green-700 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-950',
  },
  NEGOTIATION: {
    label: 'Negocjacje',
    color: '#eab308',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    bgClass: 'bg-yellow-100 dark:bg-yellow-950',
  },
  INSTALLATION: {
    label: 'Instalacja',
    color: '#0ea5e9',
    textClass: 'text-sky-700 dark:text-sky-400',
    bgClass: 'bg-sky-100 dark:bg-sky-950',
  },
  REJECTED: {
    label: 'Odrzucona',
    color: '#dc2626',
    textClass: 'text-red-700 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-950',
  },
  FREE: {
    label: 'Wolna',
    color: '#94a3b8',
    textClass: 'text-slate-600 dark:text-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
  },
};

export const LOCATION_STATUSES = Object.keys(STATUS_META) as LocationStatus[];

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  OSIEDLE: 'Osiedle',
  SKLEP: 'Sklep',
  GALERIA: 'Galeria',
  URZAD: 'Urząd',
  PARKING: 'Parking',
  INNE: 'Inne',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  SALES: 'Handlowiec',
  INVESTOR: 'Inwestor',
  SERVICE: 'Serwisant',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Do zrobienia',
  IN_PROGRESS: 'W toku',
  DONE: 'Zrobione',
  CANCELLED: 'Anulowane',
};

export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Niski', color: '#94a3b8' },
  MEDIUM: { label: 'Średni', color: '#0ea5e9' },
  HIGH: { label: 'Wysoki', color: '#f59e0b' },
  URGENT: { label: 'Pilny', color: '#dc2626' },
};

/** Domyślny środek mapy — Polska. */
export const DEFAULT_MAP_CENTER = { lat: 52.0693, lng: 19.4803 };
export const DEFAULT_MAP_ZOOM = 6;
