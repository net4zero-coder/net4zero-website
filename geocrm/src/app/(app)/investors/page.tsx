import { Briefcase, MapPin, Cpu, FileSignature, TrendingUp, Package, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { getInvestors } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function InvestorsPage() {
  const user = await getCurrentUser();
  const investors = await getInvestors(user?.organizationId ?? null);

  return (
    <div>
      <PageHeader title="Inwestorzy" description="Portfele inwestorów: lokalizacje, urządzenia, ROI i prognozy." />
      <div className="space-y-4 p-4 lg:p-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {investors.map((inv) => (
            <Card key={inv.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{inv.name}</p>
                  {inv.contactPerson && <p className="text-xs text-muted-foreground">{inv.contactPerson}</p>}
                </div>
                {inv.avgRoi != null && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                    <TrendingUp className="h-3.5 w-3.5" /> ROI {inv.avgRoi}%
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Metric icon={MapPin} label="Lokalizacje" value={inv.locationCount} />
                <Metric icon={Cpu} label="Urządzenia" value={inv.deviceCount} />
                <Metric icon={FileSignature} label="Podpisane" value={inv.signedCount} />
              </div>

              <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                Prognoza: {formatNumber(inv.forecastPackages)} opakowań / mc
              </div>

              {(inv.email || inv.phone) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {inv.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {inv.email}
                    </span>
                  )}
                  {inv.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {inv.phone}
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
        {investors.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            <Briefcase className="mx-auto mb-2 h-6 w-6" /> Brak inwestorów.
          </Card>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-lg font-semibold leading-none">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
