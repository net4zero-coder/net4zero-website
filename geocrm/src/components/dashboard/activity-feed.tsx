import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';
import type { ActivityItem } from '@/types';

const DOT: Record<string, string> = {
  STATUS_CHANGED: '#0ea5e9',
  LOCATION_CREATED: '#4CAF50',
  CONTRACT_SIGNED: '#16a34a',
  TASK_DONE: '#8b5cf6',
  NOTE_ADDED: '#f59e0b',
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ostatnie aktywności</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {items.map((a) => (
            <li key={a.id} className="flex gap-3">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: DOT[a.type] ?? '#94a3b8' }}
              />
              <div className="min-w-0">
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {a.user ? `${a.user} · ` : ''}
                  {timeAgo(a.createdAt)}
                </p>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-sm text-muted-foreground">Brak aktywności.</li>
          )}
        </ol>
      </CardContent>
    </Card>
  );
}
