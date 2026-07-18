import type { Role } from '@prisma/client';

/**
 * Model uprawnień (RBAC).
 *
 * Uprawnienia mają postać `zasób:akcja`. `*` oznacza pełny dostęp.
 * Macierz jest jedynym źródłem prawdy dla `can()` po stronie serwera
 * oraz do warunkowego renderowania UI.
 */
export type Permission =
  | 'dashboard:view'
  | 'locations:view'
  | 'locations:create'
  | 'locations:edit'
  | 'locations:delete'
  | 'regions:view'
  | 'regions:manage' // rysowanie/edycja/usuwanie/przypisywanie
  | 'investors:view'
  | 'investors:manage'
  | 'operators:view'
  | 'operators:manage'
  | 'agents:view'
  | 'agents:manage'
  | 'tasks:view'
  | 'tasks:manage'
  | 'documents:view'
  | 'documents:manage'
  | 'devices:view'
  | 'devices:manage'
  | 'reports:view'
  | 'reports:export'
  | 'users:manage'
  | 'settings:manage';

const ALL: Permission[] = [
  'dashboard:view',
  'locations:view',
  'locations:create',
  'locations:edit',
  'locations:delete',
  'regions:view',
  'regions:manage',
  'investors:view',
  'investors:manage',
  'operators:view',
  'operators:manage',
  'agents:view',
  'agents:manage',
  'tasks:view',
  'tasks:manage',
  'documents:view',
  'documents:manage',
  'devices:view',
  'devices:manage',
  'reports:view',
  'reports:export',
  'users:manage',
  'settings:manage',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Administrator — wszystko
  ADMIN: ALL,

  // Manager — wszystko poza zarządzaniem kontami użytkowników i ustawieniami org
  MANAGER: [
    'dashboard:view',
    'locations:view',
    'locations:create',
    'locations:edit',
    'locations:delete',
    'regions:view',
    'regions:manage',
    'investors:view',
    'investors:manage',
    'operators:view',
    'operators:manage',
    'agents:view',
    'agents:manage',
    'tasks:view',
    'tasks:manage',
    'documents:view',
    'documents:manage',
    'devices:view',
    'devices:manage',
    'reports:view',
    'reports:export',
  ],

  // Handlowiec — praca operacyjna na swoich lokalizacjach/zadaniach
  SALES: [
    'dashboard:view',
    'locations:view',
    'locations:create',
    'locations:edit',
    'regions:view',
    'investors:view',
    'operators:view',
    'tasks:view',
    'tasks:manage',
    'documents:view',
    'documents:manage',
    'reports:view',
  ],

  // Inwestor — podgląd swojego portfela
  INVESTOR: [
    'dashboard:view',
    'locations:view',
    'documents:view',
    'devices:view',
    'reports:view',
  ],

  // Serwisant — instalacje i serwis urządzeń
  SERVICE: [
    'dashboard:view',
    'locations:view',
    'tasks:view',
    'tasks:manage',
    'devices:view',
    'devices:manage',
    'documents:view',
  ],
};

/** Czy dana rola ma uprawnienie. */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Czy rola ma którekolwiek z uprawnień. */
export function canAny(role: Role | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
