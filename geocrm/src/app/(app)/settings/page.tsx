import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Ustawienia"
      stage="Etap 2 / 16"
      description="Zarządzanie użytkownikami, rolami i konfiguracją organizacji."
      features={[
        'Zarządzanie użytkownikami i rolami (Admin, Manager, Handlowiec, Inwestor, Serwisant)',
        'Zaproszenia do zespołu',
        'Konfiguracja organizacji i integracji',
        'Klucze API (Google Maps, storage)',
      ]}
    />
  );
}
