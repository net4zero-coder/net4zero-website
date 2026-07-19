/**
 * Abstrakcja storage dla modułu dokumentów (Etap 11).
 *
 * Obsługiwani dostawcy: Supabase Storage lub AWS S3 (wybór przez STORAGE_PROVIDER).
 * Fizyczny upload plików (multipart → bucket) zostanie podłączony w kolejnej iteracji;
 * na tym etapie rejestrujemy metadane dokumentu (nazwa, kategoria, URL, powiązania).
 */

export type StorageProvider = 'supabase' | 's3';

export const STORAGE_PROVIDER: StorageProvider =
  (process.env.STORAGE_PROVIDER as StorageProvider) || 'supabase';

/** Czy skonfigurowano poświadczenia storage (do włączenia realnego uploadu). */
export function storageConfigured(): boolean {
  if (STORAGE_PROVIDER === 's3') {
    return Boolean(process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Mapuje MIME/nazwę pliku na kategorię dokumentu. */
export function categoryFromName(name: string): 'PDF' | 'WORD' | 'EXCEL' | 'IMAGE' | 'OTHER' {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'WORD';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'EXCEL';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'IMAGE';
  return 'OTHER';
}
