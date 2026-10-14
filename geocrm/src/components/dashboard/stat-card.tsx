import { Card } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  accentClass = 'text-primary',
  hint,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accentClass?: string;
  hint?: string;
}) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatNumber(value)}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('rounded-lg bg-secondary p-2.5', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
