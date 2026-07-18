import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function DevicesPage() {
  return (
    <ModulePlaceholder
      title="Urządzenia"
      stage="Etap 16+ (moduł kaucyjny)"
      description="Rejestr recyklomatów: status, instalacje, serwis, monitoring."
      features={[
        'Rejestr urządzeń (numer seryjny, model, status)',
        'Powiązanie z lokalizacją, operatorem i inwestorem',
        'Historia instalacji i serwisów',
        'Integracja z operatorami i monitoring stanu (roadmap)',
      ]}
    />
  );
}
