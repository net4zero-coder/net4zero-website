'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Trash2, CalendarClock, MapPin, LayoutGrid, List as ListIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { TASK_STATUS_LABELS, TASK_PRIORITY_META } from '@/lib/constants';
import { createTask, updateTaskStatus, deleteTask, type TaskFormState } from '@/app/actions/tasks';
import type { Option, TaskItem, TaskStatus, TaskPriority } from '@/types';

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function TasksBoard({
  tasks,
  assignees,
  locations,
}: {
  tasks: TaskItem[];
  assignees: Option[];
  locations: Option[];
}) {
  const router = useRouter();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [creating, setCreating] = useState(false);
  const [priority, setPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [assignee, setAssignee] = useState<string>('ALL');
  const [isPending, startTransition] = useTransition();
  const [createState, createAction] = useActionState<TaskFormState, FormData>(createTask, undefined);

  useEffect(() => {
    if (createState?.success) {
      setCreating(false);
      router.refresh();
    }
  }, [createState?.success, router]);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (priority === 'ALL' || t.priority === priority) &&
          (assignee === 'ALL' || t.assignee === assignee),
      ),
    [tasks, priority, assignee],
  );

  const move = (id: string, status: TaskStatus) =>
    startTransition(async () => {
      const res = await updateTaskStatus(id, status);
      if (res?.error) alert(res.error);
      router.refresh();
    });

  const remove = (t: TaskItem) => {
    if (!confirm(`Usunąć zadanie „${t.title}”?`)) return;
    startTransition(async () => {
      const res = await deleteTask(t.id);
      if (res?.error) alert(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Pasek narzędzi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            <button
              onClick={() => setView('board')}
              className={cn('flex items-center gap-1.5 rounded px-2.5 py-1 text-sm', view === 'board' ? 'bg-secondary' : '')}
            >
              <LayoutGrid className="h-4 w-4" /> Tablica
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('flex items-center gap-1.5 rounded px-2.5 py-1 text-sm', view === 'list' ? 'bg-secondary' : '')}
            >
              <ListIcon className="h-4 w-4" /> Lista
            </button>
          </div>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as never)} className="h-9 w-auto">
            <option value="ALL">Priorytet</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_META[p].label}
              </option>
            ))}
          </Select>
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-9 w-auto">
            <option value="ALL">Osoba</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {creating ? 'Anuluj' : 'Nowe zadanie'}
        </Button>
      </div>

      {/* Formularz nowego zadania */}
      {creating && (
        <Card className="p-4">
          <form action={createAction} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input name="title" placeholder="Tytuł zadania *" required />
            </div>
            <div className="sm:col-span-2">
              <textarea
                name="description"
                rows={2}
                placeholder="Opis (opcjonalnie)"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Select name="priority" defaultValue="MEDIUM">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  Priorytet: {TASK_PRIORITY_META[p].label}
                </option>
              ))}
            </Select>
            <Input name="dueDate" type="date" />
            <Select name="assigneeId" defaultValue="">
              <option value="">Osoba: — brak —</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
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
            {createState?.error && (
              <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {createState.error}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit">Utwórz zadanie</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Widok */}
      {view === 'board' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = filtered.filter((t) => t.status === col);
            return (
              <div key={col} className="rounded-lg bg-secondary/40 p-2">
                <div className="mb-2 flex items-center justify-between px-1 py-1">
                  <span className="text-sm font-semibold">{TASK_STATUS_LABELS[col]}</span>
                  <span className="rounded-full bg-background px-2 text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((t) => (
                    <TaskCard key={t.id} task={t} onMove={move} onDelete={remove} disabled={isPending} />
                  ))}
                  {items.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="divide-y">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <PriorityDot priority={t.priority} />
                  <span className="truncate font-medium">{t.title}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.assignee ?? '—'}
                  {t.locationName ? ` · ${t.locationName}` : ''}
                  {t.dueDate ? ` · termin ${formatDate(t.dueDate)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={t.status}
                  onChange={(e) => move(t.id, e.target.value as TaskStatus)}
                  className="h-8 w-auto text-xs"
                  disabled={isPending}
                >
                  {COLUMNS.map((c) => (
                    <option key={c} value={c}>
                      {TASK_STATUS_LABELS[c]}
                    </option>
                  ))}
                </Select>
                <Button variant="ghost" size="icon" onClick={() => remove(t)} disabled={isPending} aria-label="Usuń">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Brak zadań.</p>}
        </Card>
      )}
    </div>
  );
}

function PriorityDot({ priority }: { priority: TaskPriority }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: TASK_PRIORITY_META[priority].color }} />;
}

function TaskCard({
  task,
  onMove,
  onDelete,
  disabled,
}: {
  task: TaskItem;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (t: TaskItem) => void;
  disabled: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <button onClick={() => onDelete(task)} disabled={disabled} aria-label="Usuń" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-white" style={{ backgroundColor: TASK_PRIORITY_META[task.priority].color }}>
          {TASK_PRIORITY_META[task.priority].label}
        </span>
        {task.assignee && <span>👤 {task.assignee}</span>}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
      {task.locationName && (
        <Link href={`/locations/${task.locationId}`} className="mt-1.5 flex items-center gap-1 text-[11px] text-primary hover:underline">
          <MapPin className="h-3 w-3" /> {task.locationName}
        </Link>
      )}
      <Select
        value={task.status}
        onChange={(e) => onMove(task.id, e.target.value as TaskStatus)}
        className="mt-2 h-8 text-xs"
        disabled={disabled}
      >
        {COLUMNS.map((c) => (
          <option key={c} value={c}>
            {TASK_STATUS_LABELS[c]}
          </option>
        ))}
      </Select>
    </Card>
  );
}
