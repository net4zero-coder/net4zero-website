import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function InvestorsPage() {
  return (
    <ModulePlaceholder
      title="Inwestorzy"
      stage="Etap 10"
      description="Portfele inwestorów: lokalizacje, urządzenia, ROI, przychody, umowy."
      features={[
        'Lista lokalizacji i urządzeń inwestora',
        'ROI, przychody i status inwestycji',
        'Umowy i dokumenty przypisane do inwestora',
        'Konto logowania dla inwestora (rola INVESTOR, podgląd portfela)',
      ]}
    />
  );
}
