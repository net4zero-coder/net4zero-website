import * as React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_META } from '@/lib/constants';
import type { LocationStatus } from '@prisma/client';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      {...props}
    />
  );
}

/** Badge statusu lokalizacji z kolorem z jedynego źródła prawdy. */
export function StatusBadge({ status, className }: { status: LocationStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge className={cn(meta.bgClass, meta.textClass, className)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </Badge>
  );
}
