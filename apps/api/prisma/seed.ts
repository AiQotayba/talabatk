import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deliveryapp.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@deliveryapp.com',
      phone: '+1234567890',
      hashed_password: adminPassword,
      role: UserRole.admin,
      phone_verified: true,
    },
  });

  // Create sample client
  const clientPassword = await hashPassword('client123');
  const client = await prisma.user.upsert({
    where: { email: 'client@deliveryapp.com' },
    update: {},
    create: {
      name: 'John Client',
      email: 'client@deliveryapp.com',
      phone: '+1234567891',
      hashed_password: clientPassword,
      role: UserRole.client,
      phone_verified: true,
    },
  });

  // Create sample driver
  const driverPassword = await hashPassword('driver123');
  const driver = await prisma.user.upsert({
    where: { email: 'driver@deliveryapp.com' },
    update: {},
    create: {
      name: 'Mike Driver',
      email: 'driver@deliveryapp.com',
      phone: '+1234567892',
      hashed_password: driverPassword,
      role: UserRole.driver,
      phone_verified: true,
      metadata: {
        current_location: { lat: 40.7128, lng: -74.0060 },
        last_location_update: new Date().toISOString(),
      },
    },
  });

  // Create sample address for client
  const address = await prisma.address.create({
    data: {
      user_id: client.id,
      city: 'New York',
      street: '123 Main St',
      label: 'Home',
      lat: 40.7128,
      lng: -74.0060,
      is_default: true,
      notes: 'Apartment 4B',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin:', admin.email, '(password: admin123)');
  console.log('👤 Client:', client.email, '(password: client123)');
  console.log('👤 Driver:', driver.email, '(password: driver123)');
  console.log('🏠 Address created for client');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
