import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';

/**
 * Placeholder modułu z roadmapy. Trasa i nawigacja są gotowe — zawartość
 * dostarczana w kolejnych etapach. Trzyma spójność UI i pokazuje zakres.
 */
export function ModulePlaceholder({
  title,
  stage,
  description,
  features,
}: {
  title: string;
  stage: string;
  description: string;
  features: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="p-4 lg:p-8">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Construction className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-primary">{stage}</p>
          <h2 className="mt-1 text-lg font-semibold">Moduł w przygotowaniu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Trasa i model danych są gotowe. Poniżej zakres funkcjonalny tego modułu:
          </p>
          <ul className="mx-auto mt-5 max-w-md space-y-2 text-left">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
