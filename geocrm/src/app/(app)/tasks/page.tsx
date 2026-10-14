import { PageHeader } from '@/components/page-header';
import { TasksBoard } from '@/components/tasks/tasks-board';
import { getCurrentUser } from '@/lib/session';
import { getTasks, getAgentOptions, getLocationOptions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [tasks, assignees, locations] = await Promise.all([
    getTasks(orgId),
    getAgentOptions(orgId),
    getLocationOptions(orgId),
  ]);

  return (
    <div>
      <PageHeader title="Zadania" description="Zadania zespołu — widok tablicy (kanban) i listy, z priorytetami i terminami." />
      <div className="p-4 lg:p-8">
        <TasksBoard tasks={tasks} assignees={assignees} locations={locations} />
      </div>
    </div>
  );
}
