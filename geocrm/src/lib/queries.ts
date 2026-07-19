import { prisma } from './prisma';
import {
  IS_DEMO,
  DEMO_LOCATIONS,
  DEMO_ACTIVITIES,
  DEMO_AGENT_OPTIONS,
  DEMO_INVESTOR_OPTIONS,
  demoDashboardStats,
  demoLocationDetail,
  demoRegions,
} from './demo-data';
import type {
  ActivityItem,
  DashboardStats,
  GeoJSONPolygon,
  LocationDetail,
  LocationListItem,
  LocationStatus,
  Option,
  RegionItem,
} from '@/types';

export interface LocationFilters {
  search?: string;
  status?: LocationStatus;
  regionId?: string;
  city?: string;
  voivodeship?: string;
}

/**
 * Warstwa dostępu do danych. W trybie demo (brak DATABASE_URL) zwraca dane
 * przykładowe; w każdym innym przypadku odpytuje Postgresa przez Prismę,
 * a przy błędzie połączenia degraduje się do danych demo (fail-safe).
 */

export async function getLocations(
  orgId: string | null,
  filters: LocationFilters = {},
): Promise<LocationListItem[]> {
  if (IS_DEMO || !orgId) return filterDemo(filters);

  try {
    const rows = await prisma.location.findMany({
      where: {
        organizationId: orgId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.regionId ? { regionId: filters.regionId } : {}),
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.voivodeship ? { voivodeship: filters.voivodeship } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { address: { contains: filters.search, mode: 'insensitive' } },
                { city: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { region: true, agent: true, investor: true, operator: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });

    return rows.map((l) => ({
      id: l.id,
      name: l.name,
      address: l.address,
      city: l.city,
      voivodeship: l.voivodeship,
      latitude: l.latitude,
      longitude: l.longitude,
      status: l.status,
      type: l.type,
      regionName: l.region?.name ?? null,
      agentName: l.agent?.name ?? null,
      investorName: l.investor?.name ?? null,
      operatorName: l.operator?.name ?? null,
      forecastPackages: l.forecastPackages,
      roi: l.roi,
      deviceNumber: l.deviceNumber,
      updatedAt: l.updatedAt.toISOString(),
    }));
  } catch {
    return filterDemo(filters);
  }
}

function filterDemo(filters: LocationFilters): LocationListItem[] {
  return DEMO_LOCATIONS.filter((l) => {
    if (filters.status && l.status !== filters.status) return false;
    if (filters.city && l.city !== filters.city) return false;
    if (filters.voivodeship && l.voivodeship !== filters.voivodeship) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${l.name} ${l.address ?? ''} ${l.city ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export async function getLocationById(
  orgId: string | null,
  id: string,
): Promise<LocationDetail | null> {
  if (IS_DEMO || !orgId) return demoLocationDetail(id);

  try {
    const l = await prisma.location.findFirst({
      where: { id, organizationId: orgId },
      include: {
        region: true,
        agent: true,
        investor: true,
        operator: true,
        contacts: true,
        notes: { include: { author: true }, orderBy: { createdAt: 'desc' } },
        photos: true,
        documents: { orderBy: { createdAt: 'desc' } },
        tasks: { include: { assignee: true }, orderBy: { createdAt: 'desc' } },
        history: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!l) return null;

    return {
      id: l.id,
      name: l.name,
      address: l.address,
      city: l.city,
      voivodeship: l.voivodeship,
      postalCode: l.postalCode,
      latitude: l.latitude,
      longitude: l.longitude,
      status: l.status,
      type: l.type,
      description: l.description,
      regionName: l.region?.name ?? null,
      agentName: l.agent?.name ?? null,
      investorName: l.investor?.name ?? null,
      operatorName: l.operator?.name ?? null,
      forecastPackages: l.forecastPackages,
      roi: l.roi,
      deviceNumber: l.deviceNumber,
      contactName: l.contactName,
      contactPhone: l.contactPhone,
      contactEmail: l.contactEmail,
      ownerName: l.ownerName,
      plannedInstall: l.plannedInstall?.toISOString() ?? null,
      launchedAt: l.launchedAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      notes: l.notes.map((n) => ({ id: n.id, body: n.body, author: n.author?.name ?? null, createdAt: n.createdAt.toISOString() })),
      contacts: l.contacts.map((c) => ({ id: c.id, name: c.name, role: c.role, phone: c.phone, email: c.email })),
      history: l.history.map((h) => ({ id: h.id, field: h.field, oldValue: h.oldValue, newValue: h.newValue, user: h.user?.name ?? null, createdAt: h.createdAt.toISOString() })),
      documents: l.documents.map((d) => ({ id: d.id, name: d.name, category: d.category, url: d.url, createdAt: d.createdAt.toISOString() })),
      photos: l.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption })),
      tasks: l.tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate?.toISOString() ?? null, assignee: t.assignee?.name ?? null })),
    };
  } catch {
    return demoLocationDetail(id);
  }
}

export async function getDashboardStats(orgId: string | null): Promise<DashboardStats> {
  if (IS_DEMO || !orgId) return demoDashboardStats();

  try {
    const [locations, activeInvestors, regions, signedContracts, devices, grouped] =
      await Promise.all([
        prisma.location.count({ where: { organizationId: orgId } }),
        prisma.investor.count({ where: { organizationId: orgId, active: true } }),
        prisma.region.count({ where: { organizationId: orgId } }),
        prisma.contract.count({ where: { organizationId: orgId, status: 'SIGNED' } }),
        prisma.device.count({ where: { organizationId: orgId } }),
        prisma.location.groupBy({
          by: ['status'],
          where: { organizationId: orgId },
          _count: true,
        }),
      ]);

    const byStatus = (s: LocationStatus) => grouped.find((g) => g.status === s)?._count ?? 0;

    return {
      locations,
      activeInvestors,
      regions,
      signedContracts,
      devices,
      installations: byStatus('INSTALLATION'),
      inNegotiation: byStatus('NEGOTIATION'),
      statusBreakdown: (['SIGNED', 'NEGOTIATION', 'INSTALLATION', 'REJECTED', 'FREE'] as LocationStatus[]).map(
        (status) => ({ status, count: byStatus(status) }),
      ),
      monthlyProgress: demoDashboardStats().monthlyProgress,
      topRegions: demoDashboardStats().topRegions,
    };
  } catch {
    return demoDashboardStats();
  }
}

export async function getRegions(orgId: string | null): Promise<RegionItem[]> {
  if (IS_DEMO || !orgId) return demoRegions();

  try {
    const rows = await prisma.region.findMany({
      where: { organizationId: orgId },
      include: { agent: true, investor: true, _count: { select: { locations: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      color: r.color,
      geometry: (r.geometry as unknown as GeoJSONPolygon | null) ?? null,
      agentId: r.agentId,
      agentName: r.agent?.name ?? null,
      investorId: r.investorId,
      investorName: r.investor?.name ?? null,
      locationCount: r._count.locations,
    }));
  } catch {
    return demoRegions();
  }
}

export async function getAgentOptions(orgId: string | null): Promise<Option[]> {
  if (IS_DEMO || !orgId) return DEMO_AGENT_OPTIONS;
  try {
    const rows = await prisma.user.findMany({
      where: { organizationId: orgId, role: { in: ['SALES', 'MANAGER'] }, active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map((u) => ({ id: u.id, name: u.name ?? '—' }));
  } catch {
    return DEMO_AGENT_OPTIONS;
  }
}

export async function getInvestorOptions(orgId: string | null): Promise<Option[]> {
  if (IS_DEMO || !orgId) return DEMO_INVESTOR_OPTIONS;
  try {
    const rows = await prisma.investor.findMany({
      where: { organizationId: orgId, active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return rows.map((i) => ({ id: i.id, name: i.name }));
  } catch {
    return DEMO_INVESTOR_OPTIONS;
  }
}

export async function getRecentActivities(orgId: string | null): Promise<ActivityItem[]> {
  if (IS_DEMO || !orgId) return DEMO_ACTIVITIES;

  try {
    const rows = await prisma.activity.findMany({
      where: { organizationId: orgId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return rows.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      user: a.user?.name ?? null,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch {
    return DEMO_ACTIVITIES;
  }
}
