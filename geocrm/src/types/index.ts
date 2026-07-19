import type {
  LocationStatus,
  LocationType,
  Role,
  TaskStatus,
  TaskPriority,
  RegionType,
} from '@prisma/client';

export type { LocationStatus, LocationType, Role, TaskStatus, TaskPriority, RegionType };

/** GeoJSON Polygon: coordinates = [ring][point][lng, lat]. */
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface RegionItem {
  id: string;
  name: string;
  type: RegionType;
  color: string | null;
  geometry: GeoJSONPolygon | null;
  agentId: string | null;
  agentName: string | null;
  investorId: string | null;
  investorName: string | null;
  locationCount: number;
}

/** Uproszczona opcja do selectów (handlowcy, inwestorzy). */
export interface Option {
  id: string;
  name: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  organizationId: string | null;
}

export interface LocationListItem {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  voivodeship: string | null;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  type: LocationType;
  regionName: string | null;
  agentName: string | null;
  investorName: string | null;
  operatorName: string | null;
  forecastPackages: number | null;
  roi: number | null;
  deviceNumber: string | null;
  updatedAt: string;
}

export interface LocationNote {
  id: string;
  body: string;
  author: string | null;
  createdAt: string;
}

export interface LocationContact {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
}

export interface LocationHistoryEntry {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  user: string | null;
  createdAt: string;
}

export interface LocationDocument {
  id: string;
  name: string;
  category: string;
  url: string;
  createdAt: string;
}

export interface LocationTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: string | null;
}

export interface LocationDetail extends LocationListItem {
  description: string | null;
  postalCode: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  ownerName: string | null;
  plannedInstall: string | null;
  launchedAt: string | null;
  createdAt: string;
  notes: LocationNote[];
  contacts: LocationContact[];
  history: LocationHistoryEntry[];
  documents: LocationDocument[];
  photos: { id: string; url: string; caption: string | null }[];
  tasks: LocationTask[];
}

export interface DashboardStats {
  locations: number;
  activeInvestors: number;
  regions: number;
  signedContracts: number;
  devices: number;
  installations: number;
  inNegotiation: number;
  statusBreakdown: { status: LocationStatus; count: number }[];
  monthlyProgress: { month: string; signed: number; installed: number }[];
  topRegions: { name: string; count: number }[];
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  user: string | null;
  createdAt: string;
}
