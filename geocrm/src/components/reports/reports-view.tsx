'use client';

import { useMemo } from 'react';
import { Download, FileDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toCsv, downloadCsv } from '@/lib/csv';
import { STATUS_META, LOCATION_TYPE_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type { AgentSummary, InvestorSummary, LocationListItem, RegionItem } from '@/types';

interface ReportTableProps {
  title: string;
  headers: string[];
  rows: (string | number | null)[][];
  filename: string;
}

function ReportTable({ title, headers, rows, filename }: ReportTableProps) {
  const exportCsv = () => downloadCsv(filename, toCsv(headers, rows));
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                {headers.map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-2 py-2">
                      {cell ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="px-2 py-4 text-center text-muted-foreground">
                    Brak danych.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportsView({
  locations,
  agents,
  investors,
  regions,
}: {
  locations: LocationListItem[];
  agents: AgentSummary[];
  investors: InvestorSummary[];
  regions: RegionItem[];
}) {
  const total = locations.length;

  const byStatus = useMemo(() => {
    return Object.entries(STATUS_META).map(([status, meta]) => {
      const count = locations.filter((l) => l.status === status).length;
      const pct = total ? Math.round((count / total) * 100) : 0;
      return [meta.label, count, `${pct}%`] as (string | number)[];
    });
  }, [locations, total]);

  const byVoivodeship = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of locations) map.set(l.voivodeship ?? '—', (map.get(l.voivodeship ?? '—') ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => [name, count]);
  }, [locations]);

  const exportAllLocations = () => {
    const headers = ['Nazwa', 'Adres', 'Miasto', 'Województwo', 'Status', 'Typ', 'Region', 'Handlowiec', 'Inwestor', 'Operator', 'Prognoza opak./mc', 'ROI %', 'Nr urządzenia', 'Lat', 'Lng'];
    const rows = locations.map((l) => [
      l.name, l.address, l.city, l.voivodeship, STATUS_META[l.status].label, LOCATION_TYPE_LABELS[l.type],
      l.regionName, l.agentName, l.investorName, l.operatorName, l.forecastPackages, l.roi, l.deviceNumber,
      l.latitude, l.longitude,
    ]);
    downloadCsv('lokalizacje-net4zero', toCsv(headers, rows));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Zestawienia dla {formatNumber(total)} lokalizacji. Eksport do CSV (Excel); PDF/XLSX w planie.
        </p>
        <Button onClick={exportAllLocations}>
          <FileDown className="h-4 w-4" /> Eksportuj wszystkie lokalizacje
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportTable
          title="Lokalizacje wg statusu"
          headers={['Status', 'Liczba', 'Udział']}
          rows={byStatus}
          filename="raport-statusy"
        />
        <ReportTable
          title="Lokalizacje wg województwa"
          headers={['Województwo', 'Liczba']}
          rows={byVoivodeship}
          filename="raport-wojewodztwa"
        />
        <ReportTable
          title="Handlowcy"
          headers={['Handlowiec', 'Lokalizacje', 'Podpisane', 'Regiony', 'Prognoza opak./mc']}
          rows={agents.map((a) => [a.name, a.locationCount, a.signedCount, a.regionCount, a.forecastPackages])}
          filename="raport-handlowcy"
        />
        <ReportTable
          title="Inwestorzy"
          headers={['Inwestor', 'Lokalizacje', 'Urządzenia', 'Podpisane', 'Śr. ROI %', 'Prognoza opak./mc']}
          rows={investors.map((i) => [i.name, i.locationCount, i.deviceCount, i.signedCount, i.avgRoi, i.forecastPackages])}
          filename="raport-inwestorzy"
        />
        <ReportTable
          title="Regiony"
          headers={['Region', 'Typ', 'Lokalizacje', 'Handlowiec']}
          rows={regions.map((r) => [r.name, r.type, r.locationCount, r.agentName])}
          filename="raport-regiony"
        />
      </div>
    </div>
  );
}
