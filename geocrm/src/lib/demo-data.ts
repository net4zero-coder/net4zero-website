import type {
  ActivityItem,
  AgentSummary,
  DashboardStats,
  DeviceItem,
  DocumentItem,
  InvestorSummary,
  LocationDetail,
  LocationListItem,
  Option,
  RegionItem,
  SessionUser,
  TaskItem,
} from '@/types';
import { pointInPolygon } from './geo';

/**
 * Tryb demo — aktywny gdy brak DATABASE_URL. Pozwala uruchomić i zobaczyć
 * całą aplikację (mapa, dashboard, lista, karty) bez provisioningu Postgresa.
 * Dane odzwierciedlają realny kontekst NET4ZERO (recyklomaty w polskich miastach).
 */
export const IS_DEMO = !process.env.DATABASE_URL;

export const DEMO_SESSION_USER: SessionUser = {
  id: 'demo-admin',
  name: 'Demo Administrator',
  email: 'admin@net4zero.pl',
  image: null,
  role: 'ADMIN',
  organizationId: 'demo-org',
};

/** Konto demonstracyjne do logowania (gdy brak bazy). */
export const DEMO_CREDENTIALS = {
  email: 'admin@net4zero.pl',
  password: 'demo1234',
};

const AGENTS = ['Darek Kowalczyk', 'Adam Nowak', 'Michał Wiśniewski', 'Sebastian Zieliński'];
const INVESTORS = ['Eliongroup Sp. z o.o.', 'SM Wrocław Południe', 'ZGL Zamość', 'Fundusz EkoKapitał'];
const OPERATORS = ['NET4ZERO Operator', 'ReturnPack S.A.', 'KaucjaSystem'];
const REGIONS = ['Dolnośląskie', 'Mazowieckie', 'Małopolskie', 'Wielkopolskie', 'Łódzkie'];

export const DEMO_LOCATIONS: LocationListItem[] = [
  {
    id: 'loc-1', name: 'Osiedle Reja 15', address: 'ul. Mikołaja Reja 15', city: 'Wrocław',
    voivodeship: 'Dolnośląskie', latitude: 51.1121, longitude: 17.0553, status: 'SIGNED',
    type: 'OSIEDLE', regionName: 'Dolnośląskie', agentName: AGENTS[0], investorName: INVESTORS[1],
    operatorName: OPERATORS[0], forecastPackages: 18500, roi: 22.4, deviceNumber: 'RVM-DS-014',
    updatedAt: '2026-07-14T10:20:00Z',
  },
  {
    id: 'loc-2', name: 'SM Wrocław Południe — Klecina', address: 'ul. Jutrzenki 12', city: 'Wrocław',
    voivodeship: 'Dolnośląskie', latitude: 51.0665, longitude: 17.0137, status: 'INSTALLATION',
    type: 'OSIEDLE', regionName: 'Dolnośląskie', agentName: AGENTS[0], investorName: INVESTORS[1],
    operatorName: OPERATORS[0], forecastPackages: 15200, roi: 19.1, deviceNumber: 'RVM-DS-021',
    updatedAt: '2026-07-16T08:05:00Z',
  },
  {
    id: 'loc-3', name: 'Galeria Kazimierz', address: 'ul. Podgórska 34', city: 'Kraków',
    voivodeship: 'Małopolskie', latitude: 50.0512, longitude: 19.9599, status: 'NEGOTIATION',
    type: 'GALERIA', regionName: 'Małopolskie', agentName: AGENTS[2], investorName: INVESTORS[3],
    operatorName: OPERATORS[1], forecastPackages: 31000, roi: 27.8, deviceNumber: null,
    updatedAt: '2026-07-15T14:40:00Z',
  },
  {
    id: 'loc-4', name: 'Osiedle Ruczaj', address: 'ul. Bobrzyńskiego 39', city: 'Kraków',
    voivodeship: 'Małopolskie', latitude: 50.0213, longitude: 19.9036, status: 'FREE',
    type: 'OSIEDLE', regionName: 'Małopolskie', agentName: AGENTS[2], investorName: null,
    operatorName: null, forecastPackages: 12000, roi: null, deviceNumber: null,
    updatedAt: '2026-07-10T09:00:00Z',
  },
  {
    id: 'loc-5', name: 'Urząd Miasta Zamość', address: 'Rynek Wielki 13', city: 'Zamość',
    voivodeship: 'Lubelskie', latitude: 50.7196, longitude: 23.2528, status: 'SIGNED',
    type: 'URZAD', regionName: 'Lubelskie', agentName: AGENTS[3], investorName: INVESTORS[2],
    operatorName: OPERATORS[0], forecastPackages: 9800, roi: 15.6, deviceNumber: 'RVM-LB-003',
    updatedAt: '2026-07-12T11:15:00Z',
  },
  {
    id: 'loc-6', name: 'Centrum Handlowe Blue City', address: 'al. Jerozolimskie 179', city: 'Warszawa',
    voivodeship: 'Mazowieckie', latitude: 52.2160, longitude: 20.9631, status: 'INSTALLATION',
    type: 'GALERIA', regionName: 'Mazowieckie', agentName: AGENTS[1], investorName: INVESTORS[0],
    operatorName: OPERATORS[0], forecastPackages: 42000, roi: 31.2, deviceNumber: 'RVM-MZ-047',
    updatedAt: '2026-07-17T07:30:00Z',
  },
  {
    id: 'loc-7', name: 'Osiedle Wilanów', address: 'ul. Klimczaka 1', city: 'Warszawa',
    voivodeship: 'Mazowieckie', latitude: 52.1615, longitude: 21.0897, status: 'NEGOTIATION',
    type: 'OSIEDLE', regionName: 'Mazowieckie', agentName: AGENTS[1], investorName: INVESTORS[3],
    operatorName: null, forecastPackages: 21000, roi: 24.0, deviceNumber: null,
    updatedAt: '2026-07-16T16:50:00Z',
  },
  {
    id: 'loc-8', name: 'Biedronka Mokotów', address: 'ul. Puławska 233', city: 'Warszawa',
    voivodeship: 'Mazowieckie', latitude: 52.1791, longitude: 21.0213, status: 'REJECTED',
    type: 'SKLEP', regionName: 'Mazowieckie', agentName: AGENTS[1], investorName: null,
    operatorName: null, forecastPackages: 8000, roi: null, deviceNumber: null,
    updatedAt: '2026-07-08T13:00:00Z',
  },
  {
    id: 'loc-9', name: 'Osiedle Nowe Żerniki', address: 'ul. Kolista 20', city: 'Wrocław',
    voivodeship: 'Dolnośląskie', latitude: 51.1524, longitude: 16.9346, status: 'FREE',
    type: 'OSIEDLE', regionName: 'Dolnośląskie', agentName: AGENTS[0], investorName: null,
    operatorName: null, forecastPackages: 14000, roi: null, deviceNumber: null,
    updatedAt: '2026-07-11T10:00:00Z',
  },
  {
    id: 'loc-10', name: 'Galeria Łódzka', address: 'al. Piłsudskiego 15/23', city: 'Łódź',
    voivodeship: 'Łódzkie', latitude: 51.7592, longitude: 19.4738, status: 'SIGNED',
    type: 'GALERIA', regionName: 'Łódzkie', agentName: AGENTS[2], investorName: INVESTORS[0],
    operatorName: OPERATORS[2], forecastPackages: 28000, roi: 26.3, deviceNumber: 'RVM-LD-009',
    updatedAt: '2026-07-13T12:20:00Z',
  },
  {
    id: 'loc-11', name: 'Stary Browar', address: 'ul. Półwiejska 42', city: 'Poznań',
    voivodeship: 'Wielkopolskie', latitude: 52.3990, longitude: 16.9146, status: 'NEGOTIATION',
    type: 'GALERIA', regionName: 'Wielkopolskie', agentName: AGENTS[3], investorName: INVESTORS[3],
    operatorName: null, forecastPackages: 25500, roi: 23.7, deviceNumber: null,
    updatedAt: '2026-07-15T09:45:00Z',
  },
  {
    id: 'loc-12', name: 'Osiedle Grunwald', address: 'ul. Grunwaldzka 104', city: 'Poznań',
    voivodeship: 'Wielkopolskie', latitude: 52.3963, longitude: 16.8859, status: 'INSTALLATION',
    type: 'OSIEDLE', regionName: 'Wielkopolskie', agentName: AGENTS[3], investorName: INVESTORS[0],
    operatorName: OPERATORS[0], forecastPackages: 17800, roi: 20.5, deviceNumber: 'RVM-WP-018',
    updatedAt: '2026-07-17T15:10:00Z',
  },
  {
    id: 'loc-13', name: 'Rynek Główny — punkt sezonowy', address: 'Rynek Główny 1', city: 'Kraków',
    voivodeship: 'Małopolskie', latitude: 50.0617, longitude: 19.9373, status: 'FREE',
    type: 'INNE', regionName: 'Małopolskie', agentName: AGENTS[2], investorName: null,
    operatorName: null, forecastPackages: 6000, roi: null, deviceNumber: null,
    updatedAt: '2026-07-09T08:30:00Z',
  },
  {
    id: 'loc-14', name: 'Osiedle Gaj', address: 'ul. Świeradowska 51', city: 'Wrocław',
    voivodeship: 'Dolnośląskie', latitude: 51.0680, longitude: 17.0459, status: 'SIGNED',
    type: 'OSIEDLE', regionName: 'Dolnośląskie', agentName: AGENTS[0], investorName: INVESTORS[1],
    operatorName: OPERATORS[0], forecastPackages: 16400, roi: 21.0, deviceNumber: 'RVM-DS-027',
    updatedAt: '2026-07-14T18:00:00Z',
  },
];

export const DEMO_TASKS: TaskItem[] = [
  { id: 'task-1', title: 'Przygotować aneks do umowy — Osiedle Reja 15', description: 'Aneks §11 klauzula efektywności.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-07-25T00:00:00Z', assignee: AGENTS[0], assigneeId: 'agent-1', locationName: 'Osiedle Reja 15', locationId: 'loc-1', createdAt: '2026-07-15T09:00:00Z' },
  { id: 'task-2', title: 'Wizja lokalna z serwisem — SM Klecina', description: null, status: 'TODO', priority: 'MEDIUM', dueDate: '2026-07-28T00:00:00Z', assignee: 'Serwis NET4ZERO', assigneeId: 'agent-4', locationName: 'SM Wrocław Południe — Klecina', locationId: 'loc-2', createdAt: '2026-07-16T10:00:00Z' },
  { id: 'task-3', title: 'Spotkanie z zarządem — Galeria Kazimierz', description: 'Prezentacja pakietu 50 IPZ.', status: 'TODO', priority: 'URGENT', dueDate: '2026-07-22T00:00:00Z', assignee: AGENTS[2], assigneeId: 'agent-3', locationName: 'Galeria Kazimierz', locationId: 'loc-3', createdAt: '2026-07-15T14:00:00Z' },
  { id: 'task-4', title: 'Przygotować ofertę — CH Blue City', description: null, status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-07-24T00:00:00Z', assignee: AGENTS[1], assigneeId: 'agent-2', locationName: 'Centrum Handlowe Blue City', locationId: 'loc-6', createdAt: '2026-07-17T08:00:00Z' },
  { id: 'task-5', title: 'Przegląd techniczny RVM-DS-014', description: 'Kwartalny przegląd.', status: 'DONE', priority: 'LOW', dueDate: '2026-07-14T00:00:00Z', assignee: 'Serwis NET4ZERO', assigneeId: 'agent-4', locationName: 'Osiedle Reja 15', locationId: 'loc-1', createdAt: '2026-07-10T08:00:00Z' },
  { id: 'task-6', title: 'Follow-up mailowy — Stary Browar', description: null, status: 'TODO', priority: 'MEDIUM', dueDate: '2026-07-26T00:00:00Z', assignee: AGENTS[3], assigneeId: 'agent-1', locationName: 'Stary Browar', locationId: 'loc-11', createdAt: '2026-07-16T11:00:00Z' },
];

export const DEMO_DOCUMENTS: DocumentItem[] = [
  { id: 'doc-1', name: 'Umowa dzierżawy v3 — Reja 15.pdf', category: 'PDF', url: '#', sizeBytes: 248000, locationName: 'Osiedle Reja 15', locationId: 'loc-1', uploadedBy: AGENTS[0], createdAt: '2026-07-14T18:00:00Z' },
  { id: 'doc-2', name: 'Rzut techniczny — Klecina.pdf', category: 'PDF', url: '#', sizeBytes: 512000, locationName: 'SM Wrocław Południe — Klecina', locationId: 'loc-2', uploadedBy: AGENTS[0], createdAt: '2026-07-12T12:00:00Z' },
  { id: 'doc-3', name: 'Prognoza ROI — Blue City.xlsx', category: 'EXCEL', url: '#', sizeBytes: 88000, locationName: 'Centrum Handlowe Blue City', locationId: 'loc-6', uploadedBy: AGENTS[1], createdAt: '2026-07-17T09:00:00Z' },
  { id: 'doc-4', name: 'Pismo do spółdzielni.docx', category: 'WORD', url: '#', sizeBytes: 45000, locationName: 'Osiedle Gaj', locationId: 'loc-14', uploadedBy: AGENTS[0], createdAt: '2026-07-13T10:00:00Z' },
  { id: 'doc-5', name: 'Zdjęcie lokalizacji — Kazimierz.jpg', category: 'IMAGE', url: '#', sizeBytes: 1240000, locationName: 'Galeria Kazimierz', locationId: 'loc-3', uploadedBy: AGENTS[2], createdAt: '2026-07-15T15:00:00Z' },
];

/** Urządzenia demo — wyprowadzone z lokalizacji posiadających numer urządzenia. */
export const DEMO_DEVICES: DeviceItem[] = DEMO_LOCATIONS.filter((l) => l.deviceNumber).map((l, i) => {
  const status = l.status === 'SIGNED' ? 'ACTIVE' : l.status === 'INSTALLATION' ? 'INSTALLED' : 'PLANNED';
  return {
    id: `device-${i + 1}`,
    serialNumber: l.deviceNumber!,
    model: i % 2 === 0 ? 'TOMRA T9' : 'Sielaff RVM-1',
    status: (i === 1 ? 'MAINTENANCE' : status) as DeviceItem['status'],
    installedAt: l.status === 'SIGNED' ? '2026-06-15T00:00:00Z' : null,
    lastServiceAt: l.status === 'SIGNED' ? '2026-07-14T00:00:00Z' : null,
    locationName: l.name,
    locationId: l.id,
    operatorName: l.operatorName,
    investorName: l.investorName,
  };
});

export const DEMO_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'STATUS_CHANGED', message: 'Osiedle Grunwald → status: Instalacja', user: AGENTS[3], createdAt: '2026-07-17T15:10:00Z' },
  { id: 'a2', type: 'LOCATION_CREATED', message: 'Dodano lokalizację: CH Blue City', user: AGENTS[1], createdAt: '2026-07-17T07:30:00Z' },
  { id: 'a3', type: 'CONTRACT_SIGNED', message: 'Podpisano umowę: Osiedle Gaj', user: AGENTS[0], createdAt: '2026-07-14T18:00:00Z' },
  { id: 'a4', type: 'TASK_DONE', message: 'Zadanie ukończone: przegląd RVM-DS-014', user: 'Serwis NET4ZERO', createdAt: '2026-07-14T12:00:00Z' },
  { id: 'a5', type: 'NOTE_ADDED', message: 'Notatka do: Galeria Kazimierz', user: AGENTS[2], createdAt: '2026-07-15T14:40:00Z' },
];

/** Opcje handlowców / inwestorów do selectów (demo). */
export const DEMO_AGENT_OPTIONS: Option[] = AGENTS.map((name, i) => ({ id: `agent-${i + 1}`, name }));
export const DEMO_INVESTOR_OPTIONS: Option[] = INVESTORS.map((name, i) => ({ id: `investor-${i + 1}`, name }));

/** Regiony demo — prostokątne obszary CUSTOM wokół klastrów lokalizacji. */
function box(minLng: number, minLat: number, maxLng: number, maxLat: number): RegionItem['geometry'] {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ],
    ],
  };
}

export const DEMO_REGIONS: RegionItem[] = [
  {
    id: 'region-wroclaw', name: 'Wrocław — Południe', type: 'CUSTOM', color: '#4CAF50',
    geometry: box(16.85, 51.0, 17.15, 51.2), agentId: 'agent-1', agentName: AGENTS[0],
    investorId: 'investor-2', investorName: INVESTORS[1], locationCount: 0,
  },
  {
    id: 'region-warszawa', name: 'Warszawa — Lewobrzeżna', type: 'CUSTOM', color: '#03A9F4',
    geometry: box(20.85, 52.1, 21.2, 52.3), agentId: 'agent-2', agentName: AGENTS[1],
    investorId: 'investor-1', investorName: INVESTORS[0], locationCount: 0,
  },
  {
    id: 'region-krakow', name: 'Kraków — Centrum', type: 'CUSTOM', color: '#8b5cf6',
    geometry: box(19.8, 49.98, 20.05, 50.1), agentId: 'agent-3', agentName: AGENTS[2],
    investorId: null, investorName: null, locationCount: 0,
  },
  {
    id: 'region-dolnoslaskie', name: 'Dolnośląskie', type: 'WOJEWODZTWO', color: '#16a34a',
    geometry: null, agentId: 'agent-1', agentName: AGENTS[0], investorId: null, investorName: null,
    locationCount: 0,
  },
];

/** Regiony demo z policzoną liczbą lokalizacji (point-in-polygon). */
export function demoRegions(): RegionItem[] {
  return DEMO_REGIONS.map((r) => ({
    ...r,
    locationCount: r.geometry
      ? DEMO_LOCATIONS.filter((l) => pointInPolygon(l.latitude, l.longitude, r.geometry!)).length
      : DEMO_LOCATIONS.filter((l) => l.voivodeship === r.name).length,
  }));
}

/** Podsumowania handlowców (Etap 9) liczone z lokalizacji demo. */
export function demoAgents(): AgentSummary[] {
  return DEMO_AGENT_OPTIONS.map((a) => {
    const locs = DEMO_LOCATIONS.filter((l) => l.agentName === a.name);
    return {
      id: a.id,
      name: a.name,
      email: `${a.name.split(' ')[0].toLowerCase()}@net4zero.pl`,
      regionCount: DEMO_REGIONS.filter((r) => r.agentName === a.name).length,
      locationCount: locs.length,
      signedCount: locs.filter((l) => l.status === 'SIGNED').length,
      openTasks: DEMO_TASKS.filter((t) => t.assignee === a.name && t.status !== 'DONE').length,
      forecastPackages: locs.reduce((s, l) => s + (l.forecastPackages ?? 0), 0),
    };
  });
}

/** Podsumowania inwestorów (Etap 10) liczone z lokalizacji demo. */
export function demoInvestors(): InvestorSummary[] {
  return DEMO_INVESTOR_OPTIONS.map((inv) => {
    const locs = DEMO_LOCATIONS.filter((l) => l.investorName === inv.name);
    const rois = locs.map((l) => l.roi).filter((r): r is number => r != null);
    return {
      id: inv.id,
      name: inv.name,
      contactPerson: 'Jan Kowalski',
      email: 'kontakt@inwestor.pl',
      phone: '+48 600 100 200',
      locationCount: locs.length,
      deviceCount: locs.filter((l) => l.deviceNumber).length,
      signedCount: locs.filter((l) => l.status === 'SIGNED').length,
      avgRoi: rois.length ? Math.round((rois.reduce((s, r) => s + r, 0) / rois.length) * 10) / 10 : null,
      forecastPackages: locs.reduce((s, l) => s + (l.forecastPackages ?? 0), 0),
    };
  });
}

function count(status: LocationListItem['status']) {
  return DEMO_LOCATIONS.filter((l) => l.status === status).length;
}

export function demoDashboardStats(): DashboardStats {
  return {
    locations: DEMO_LOCATIONS.length,
    activeInvestors: INVESTORS.length,
    regions: REGIONS.length,
    signedContracts: count('SIGNED'),
    devices: DEMO_LOCATIONS.filter((l) => l.deviceNumber).length,
    installations: count('INSTALLATION'),
    inNegotiation: count('NEGOTIATION'),
    statusBreakdown: [
      { status: 'SIGNED', count: count('SIGNED') },
      { status: 'NEGOTIATION', count: count('NEGOTIATION') },
      { status: 'INSTALLATION', count: count('INSTALLATION') },
      { status: 'REJECTED', count: count('REJECTED') },
      { status: 'FREE', count: count('FREE') },
    ],
    monthlyProgress: [
      { month: 'Lut', signed: 2, installed: 1 },
      { month: 'Mar', signed: 3, installed: 2 },
      { month: 'Kwi', signed: 4, installed: 3 },
      { month: 'Maj', signed: 5, installed: 4 },
      { month: 'Cze', signed: 4, installed: 5 },
      { month: 'Lip', signed: count('SIGNED'), installed: count('INSTALLATION') },
    ],
    topRegions: [
      { name: 'Dolnośląskie', count: DEMO_LOCATIONS.filter((l) => l.regionName === 'Dolnośląskie').length },
      { name: 'Mazowieckie', count: DEMO_LOCATIONS.filter((l) => l.regionName === 'Mazowieckie').length },
      { name: 'Małopolskie', count: DEMO_LOCATIONS.filter((l) => l.regionName === 'Małopolskie').length },
      { name: 'Wielkopolskie', count: DEMO_LOCATIONS.filter((l) => l.regionName === 'Wielkopolskie').length },
    ],
  };
}

export function demoLocationDetail(id: string): LocationDetail | null {
  const base = DEMO_LOCATIONS.find((l) => l.id === id);
  if (!base) return null;
  return {
    ...base,
    description: 'Lokalizacja o wysokim potencjale — duże zagęszczenie mieszkańców, brak konkurencyjnego punktu kaucji w promieniu 500 m.',
    postalCode: '00-000',
    contactName: 'Jan Kowalski',
    contactPhone: '+48 600 100 200',
    contactEmail: 'kontakt@spoldzielnia.pl',
    ownerName: base.investorName,
    plannedInstall: '2026-08-15T00:00:00Z',
    launchedAt: base.status === 'SIGNED' ? '2026-07-01T00:00:00Z' : null,
    createdAt: '2026-06-20T10:00:00Z',
    notes: [
      { id: 'n1', body: 'Spółdzielnia zainteresowana pakietem 3 urządzeń.', author: base.agentName, createdAt: '2026-07-10T10:00:00Z' },
      { id: 'n2', body: 'Umówione spotkanie z zarządem na przyszły tydzień.', author: base.agentName, createdAt: '2026-07-12T09:00:00Z' },
    ],
    contacts: [
      { id: 'c1', name: 'Jan Kowalski', role: 'Prezes zarządu', phone: '+48 600 100 200', email: 'prezes@spoldzielnia.pl' },
      { id: 'c2', name: 'Anna Nowak', role: 'Administracja', phone: '+48 600 300 400', email: 'admin@spoldzielnia.pl' },
    ],
    history: [
      { id: 'h1', field: 'status', oldValue: 'Negocjacje', newValue: 'Podpisana', user: base.agentName, createdAt: '2026-07-14T18:00:00Z' },
      { id: 'h2', field: 'agent', oldValue: '—', newValue: base.agentName, user: 'Manager', createdAt: '2026-06-25T11:00:00Z' },
    ],
    documents: [
      { id: 'd1', name: 'Umowa dzierżawy v3.pdf', category: 'PDF', url: '#', createdAt: '2026-07-14T18:00:00Z' },
      { id: 'd2', name: 'Rzut techniczny.pdf', category: 'PDF', url: '#', createdAt: '2026-07-05T12:00:00Z' },
    ],
    photos: [],
    tasks: [
      { id: 't1', title: 'Przygotować aneks do umowy', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-07-25T00:00:00Z', assignee: base.agentName },
      { id: 't2', title: 'Wizja lokalna z serwisem', status: 'TODO', priority: 'MEDIUM', dueDate: '2026-07-28T00:00:00Z', assignee: 'Serwis NET4ZERO' },
    ],
  };
}
