import { PrismaClient, type LocationStatus, type LocationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed bazy — organizacja demonstracyjna NET4ZERO z użytkownikami wszystkich ról,
 * inwestorami, operatorami, regionami i lokalizacjami. Uruchom: `npm run db:seed`.
 */
async function main() {
  console.log('🌱 Seeding GeoCRM…');

  const org = await prisma.organization.upsert({
    where: { slug: 'net4zero' },
    update: {},
    create: { name: 'NET4ZERO Sp. z o.o.', slug: 'net4zero' },
  });

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const users = [
    { email: 'admin@net4zero.pl', name: 'Maciej Machlajewski', role: 'ADMIN' as const },
    { email: 'manager@net4zero.pl', name: 'Anna Manager', role: 'MANAGER' as const },
    { email: 'darek@net4zero.pl', name: 'Darek Kowalczyk', role: 'SALES' as const },
    { email: 'adam@net4zero.pl', name: 'Adam Nowak', role: 'SALES' as const },
    { email: 'inwestor@net4zero.pl', name: 'Jan Inwestor', role: 'INVESTOR' as const },
    { email: 'serwis@net4zero.pl', name: 'Piotr Serwis', role: 'SERVICE' as const },
  ];

  const created: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, organizationId: org.id },
      create: { ...u, passwordHash, organizationId: org.id },
    });
    created[u.email] = user.id;
  }

  const investor = await prisma.investor.create({
    data: { organizationId: org.id, name: 'SM Wrocław Południe', contactPerson: 'Jan Kowalski', email: 'zarzad@smwp.pl', phone: '+48 71 000 00 00' },
  });
  const operator = await prisma.operator.create({
    data: { organizationId: org.id, name: 'NET4ZERO Operator', contactPerson: 'Dział Operacyjny' },
  });
  const region = await prisma.region.create({
    data: { organizationId: org.id, name: 'Dolnośląskie', type: 'WOJEWODZTWO', agentId: created['darek@net4zero.pl'], investorId: investor.id, color: '#4CAF50' },
  });

  const locations: {
    name: string; address: string; city: string; voivodeship: string;
    latitude: number; longitude: number; status: LocationStatus; type: LocationType;
  }[] = [
    { name: 'Osiedle Reja 15', address: 'ul. Mikołaja Reja 15', city: 'Wrocław', voivodeship: 'Dolnośląskie', latitude: 51.1121, longitude: 17.0553, status: 'SIGNED', type: 'OSIEDLE' },
    { name: 'SM Klecina', address: 'ul. Jutrzenki 12', city: 'Wrocław', voivodeship: 'Dolnośląskie', latitude: 51.0665, longitude: 17.0137, status: 'INSTALLATION', type: 'OSIEDLE' },
    { name: 'Osiedle Gaj', address: 'ul. Świeradowska 51', city: 'Wrocław', voivodeship: 'Dolnośląskie', latitude: 51.068, longitude: 17.0459, status: 'NEGOTIATION', type: 'OSIEDLE' },
    { name: 'Nowe Żerniki', address: 'ul. Kolista 20', city: 'Wrocław', voivodeship: 'Dolnośląskie', latitude: 51.1524, longitude: 16.9346, status: 'FREE', type: 'OSIEDLE' },
  ];

  for (const loc of locations) {
    await prisma.location.create({
      data: {
        ...loc,
        organizationId: org.id,
        regionId: region.id,
        agentId: created['darek@net4zero.pl'],
        investorId: investor.id,
        operatorId: operator.id,
        createdById: created['admin@net4zero.pl'],
        forecastPackages: 15000,
        roi: 20,
      },
    });
  }

  await prisma.activity.create({
    data: { organizationId: org.id, type: 'LOCATION_CREATED', message: 'Zaimportowano 4 lokalizacje (seed)', userId: created['admin@net4zero.pl'] },
  });

  console.log(`✅ Gotowe. Organizacja: ${org.name}, użytkowników: ${users.length}, lokalizacji: ${locations.length}`);
  console.log('   Logowanie: admin@net4zero.pl / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
