'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  X,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileType,
  Image as ImageIcon,
  File,
  Search,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate } from '@/lib/utils';
import { createDocument, deleteDocument, type DocumentFormState } from '@/app/actions/documents';
import type { DocumentItem, Option } from '@/types';

const CATEGORIES = ['PDF', 'WORD', 'EXCEL', 'IMAGE', 'OTHER'] as const;

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  WORD: FileType,
  EXCEL: FileSpreadsheet,
  IMAGE: ImageIcon,
  OTHER: File,
};

export function DocumentsManager({
  documents,
  locations,
}: {
  documents: DocumentItem[];
  locations: Option[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState<DocumentFormState, FormData>(createDocument, undefined);

  useEffect(() => {
    if (state?.success) {
      setCreating(false);
      router.refresh();
    }
  }, [state?.success, router]);

  const filtered = useMemo(
    () =>
      documents.filter((d) => {
        if (category !== 'ALL' && d.category !== category) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!`${d.name} ${d.locationName ?? ''}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [documents, search, category],
  );

  const remove = (d: DocumentItem) => {
    if (!confirm(`Usunąć dokument „${d.name}”?`)) return;
    startTransition(async () => {
      const res = await deleteDocument(d.id);
      if (res?.error) alert(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj dokumentu…" className="w-64 pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-auto">
            <option value="ALL">Wszystkie typy</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {creating ? 'Anuluj' : 'Dodaj dokument'}
        </Button>
      </div>

      {creating && (
        <Card className="p-4">
          <form action={action} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input name="name" placeholder="Nazwa pliku (np. umowa.pdf) *" required />
            </div>
            <div>
              <Input name="url" type="url" placeholder="URL do pliku *" required />
            </div>
            <Select name="category" defaultValue="PDF">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Typ: {c}
                </option>
              ))}
            </Select>
            <Select name="locationId" defaultValue="">
              <option value="">Lokalizacja: — brak —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            {state?.error && (
              <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
            )}
            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="submit">Zapisz dokument</Button>
              <span className="text-xs text-muted-foreground">
                Upload plików do Supabase/S3 zostanie podłączony w kolejnej iteracji — teraz rejestrujemy metadane i link.
              </span>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y">
        {filtered.map((d) => {
          const Icon = CATEGORY_ICON[d.category] ?? File;
          return (
            <div key={d.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.category} · {formatBytes(d.sizeBytes)} · {formatDate(d.createdAt)}
                    {d.uploadedBy ? ` · ${d.uploadedBy}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.locationName && (
                  <Link href={`/locations/${d.locationId}`} className="hidden items-center gap-1 text-xs text-primary hover:underline sm:flex">
                    <MapPin className="h-3 w-3" /> {d.locationName}
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={() => remove(d)} disabled={isPending} aria-label="Usuń">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Brak dokumentów.</p>}
      </Card>
    </div>
  );
}
