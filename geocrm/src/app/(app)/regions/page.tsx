import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function RegionsPage() {
  return (
    <ModulePlaceholder
      title="Regiony"
      stage="Etap 5"
      description="Województwa, powiaty, miasta oraz własne obszary rysowane na mapie."
      features={[
        'Rysowanie regionów na mapie (Google Maps Drawing / Geometry)',
        'Regiony predefiniowane: województwo, powiat, miasto (kody TERYT)',
        'Edycja, zmiana nazwy i usuwanie regionów',
        'Przypisywanie handlowca i inwestora do regionu',
        'Automatyczne przypisanie lokalizacji do regionu (point-in-polygon)',
      ]}
    />
  );
}
