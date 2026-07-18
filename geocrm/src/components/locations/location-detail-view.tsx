'use client';

import { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Package,
  Hash,
  History,
  StickyNote,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  Users,
  Info,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/badge';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { LOCATION_TYPE_LABELS, TASK_STATUS_LABELS, TASK_PRIORITY_META } from '@/lib/constants';
import type { LocationDetail } from '@/types';

const TABS = [
  { key: 'overview', label: 'Przegląd', icon: Info },
  { key: 'history', label: 'Historia', icon: History },
  { key: 'notes', label: 'Notatki', icon: StickyNote },
  { key: 'photos', label: 'Zdjęcia', icon: ImageIcon },
  { key: 'documents', label: 'Dokumenty', icon: FileText },
  { key: 'tasks', label: 'Zadania', icon: CheckSquare },
  { key: 'contacts', label: 'Kontakty', icon: Users },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function LocationDetailView({ location }: { location: LocationDetail }) {
  const [tab, setTab] = useState<TabKey>('overview');

  return (
    <div className="flex h-full flex-col">
      {/* Nagłówek */}
      <div className="border-b p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold leading-tight">{location.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {[location.address, location.city, location.voivodeship].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
          <StatusBadge status={location.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-secondary px-2.5 py-1">{LOCATION_TYPE_LABELS[location.type]}</span>
          {location.regionName && <span className="rounded-full bg-secondary px-2.5 py-1">{location.regionName}</span>}
          {location.deviceNumber && (
            <span className="rounded-full bg-secondary px-2.5 py-1">Nr: {location.deviceNumber}</span>
          )}
        </div>
      </div>

      {/* Zakładki */}
      <div className="flex gap-1 overflow-x-auto border-b px-2 scrollbar-thin">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Treść zakładki */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {tab === 'overview' && <Overview location={location} />}
        {tab === 'history' && <HistoryTab location={location} />}
        {tab === 'notes' && <NotesTab location={location} />}
        {tab === 'photos' && <PhotosTab location={location} />}
        {tab === 'documents' && <DocumentsTab location={location} />}
        {tab === 'tasks' && <TasksTab location={location} />}
        {tab === 'contacts' && <ContactsTab location={location} />}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function Overview({ location }: { location: LocationDetail }) {
  return (
    <div className="space-y-5">
      {location.description && <p className="text-sm text-muted-foreground">{location.description}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field icon={User} label="Handlowiec" value={location.agentName} />
        <Field icon={Building2} label="Inwestor" value={location.investorName} />
        <Field icon={Building2} label="Operator" value={location.operatorName} />
        <Field icon={User} label="Właściciel" value={location.ownerName} />
        <Field icon={Phone} label="Telefon" value={location.contactPhone} />
        <Field icon={Mail} label="E-mail" value={location.contactEmail} />
        <Field icon={Calendar} label="Planowana instalacja" value={formatDate(location.plannedInstall)} />
        <Field icon={Calendar} label="Uruchomienie" value={formatDate(location.launchedAt)} />
        <Field icon={TrendingUp} label="ROI" value={location.roi != null ? `${location.roi}%` : '—'} />
        <Field icon={Package} label="Prognoza opakowań / mc" value={location.forecastPackages?.toLocaleString('pl-PL') ?? '—'} />
        <Field icon={Hash} label="Nr urządzenia" value={location.deviceNumber} />
        <Field icon={MapPin} label="Koordynaty" value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`} />
      </div>
    </div>
  );
}

function HistoryTab({ location }: { location: LocationDetail }) {
  if (location.history.length === 0) return <Empty text="Brak historii zmian." />;
  return (
    <ol className="space-y-4">
      {location.history.map((h) => (
        <li key={h.id} className="border-l-2 border-border pl-4">
          <p className="text-sm">
            <span className="font-medium">{h.field}</span>: {h.oldValue ?? '—'} → {h.newValue ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {h.user ? `${h.user} · ` : ''}
            {timeAgo(h.createdAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function NotesTab({ location }: { location: LocationDetail }) {
  if (location.notes.length === 0) return <Empty text="Brak notatek." />;
  return (
    <ul className="space-y-3">
      {location.notes.map((n) => (
        <li key={n.id} className="rounded-lg border bg-secondary/40 p-3">
          <p className="text-sm">{n.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {n.author ? `${n.author} · ` : ''}
            {timeAgo(n.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function PhotosTab({ location }: { location: LocationDetail }) {
  if (location.photos.length === 0) return <Empty text="Brak zdjęć." />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {location.photos.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p.id} src={p.url} alt={p.caption ?? ''} className="aspect-square rounded-lg object-cover" />
      ))}
    </div>
  );
}

function DocumentsTab({ location }: { location: LocationDetail }) {
  if (location.documents.length === 0) return <Empty text="Brak dokumentów." />;
  return (
    <ul className="space-y-2">
      {location.documents.map((d) => (
        <li key={d.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.category} · {formatDate(d.createdAt)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TasksTab({ location }: { location: LocationDetail }) {
  if (location.tasks.length === 0) return <Empty text="Brak zadań." />;
  return (
    <ul className="space-y-2">
      {location.tasks.map((t) => (
        <li key={t.id} className="rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t.title}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
              style={{ backgroundColor: TASK_PRIORITY_META[t.priority].color }}
            >
              {TASK_PRIORITY_META[t.priority].label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {TASK_STATUS_LABELS[t.status]}
            {t.assignee ? ` · ${t.assignee}` : ''}
            {t.dueDate ? ` · termin ${formatDate(t.dueDate)}` : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ContactsTab({ location }: { location: LocationDetail }) {
  if (location.contacts.length === 0) return <Empty text="Brak kontaktów." />;
  return (
    <ul className="space-y-2">
      {location.contacts.map((c) => (
        <li key={c.id} className="rounded-lg border p-3">
          <p className="text-sm font-medium">{c.name}</p>
          {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
            {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>;
}
