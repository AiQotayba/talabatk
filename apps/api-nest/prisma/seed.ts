import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.rating.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.driverStatusLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.user.deleteMany();

  // // Create admin user
  // const adminPassword = await bcrypt.hash('admin123', 10);
  // const admin = await prisma.user.create({
  //   data: {
  //     role: 'admin',
  //     name: 'Admin User',
  //     email: 'admin@delivery.com',
  //     phone: '+1234567890',
  //     phone_verified: true,
  //     hashed_password: adminPassword,
  //   },
  // });

  // Create test clients
  const clientPassword = await bcrypt.hash('client123', 10);
  const client1 = await prisma.user.create({
    data: {
      role: 'client',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567891',
      phone_verified: true,
      hashed_password: clientPassword,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      role: 'client',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567892',
      phone_verified: true,
      hashed_password: clientPassword,
    },
  });

  // Create test drivers
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driver1 = await prisma.user.create({
    data: {
      role: 'driver',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1234567893',
      phone_verified: true,
      hashed_password: driverPassword,
      metadata: {
        location: { lat: 40.7128, lng: -74.006 },
        status: 'available',
      },
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      role: 'driver',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1234567894',
      phone_verified: true,
      hashed_password: driverPassword,
      metadata: {
        location: { lat: 40.7589, lng: -73.9851 },
        status: 'available',
      },
    },
  });

  // Create addresses for clients
  const address1 = await prisma.address.create({
    data: {
      user_id: client1.id,
      city: 'New York',
      street: '123 Main St',
      label: 'Home',
      lat: 40.7128,
      lng: -74.006,
      is_default: true,
    },
  });

  // const address2 = await prisma.address.create({
  //   data: {
  //     user_id: client1.id,
  //     city: 'New York',
  //     street: '456 Broadway',
  //     label: 'Office',
  //     lat: 40.7589,
  //     lng: -73.9851,
  //     is_default: false,
  //   },
  // });

  const address3 = await prisma.address.create({
    data: {
      user_id: client2.id,
      city: 'New York',
      street: '789 5th Ave',
      label: 'Home',
      lat: 40.7505,
      lng: -73.9934,
      is_default: true,
    },
  });

  // // Create sample orders
  // const order1 = await prisma.order.create({
  //   data: {
  //     client_id: client1.id,
  //     content: 'Deliver package to office',
  //     dropoff_address_id: address2.id,
  //     payment_method: 'cash',
  //     price_cents: 1500, // $15.00
  //     status: 'pending',
  //   },
  // });

  const order2 = await prisma.order.create({
    data: {
      client_id: client2.id,
      content: 'Pick up documents from downtown',
      dropoff_address_id: address3.id,
      payment_method: 'card',
      price_cents: 2000, // $20.00
      status: 'assigned',
      driver_id: driver1.id,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      client_id: client1.id,
      content: 'Food delivery',
      dropoff_address_id: address1.id,
      payment_method: 'cash',
      price_cents: 800, // $8.00
      status: 'delivered',
      driver_id: driver2.id,
      actual_pickup_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      delivered_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  // Create sample messages
  await prisma.message.create({
    data: {
      order_id: order2.id,
      from_user: client2.id,
      to_user: driver1.id,
      content: 'Please call when you arrive',
      message_type: 'text',
    },
  });

  await prisma.message.create({
    data: {
      order_id: order2.id,
      from_user: driver1.id,
      to_user: client2.id,
      content: "I'm on my way, will be there in 10 minutes",
      message_type: 'text',
    },
  });

  // Create sample rating
  await prisma.rating.create({
    data: {
      order_id: order3.id,
      client_id: client1.id,
      driver_id: driver2.id,
      score: 5,
      comment: 'Excellent service, very fast delivery!',
    },
  });

  // Create driver status logs
  await prisma.driverStatusLog.create({
    data: {
      driver_id: driver1.id,
      status: 'available',
      started_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  });

  await prisma.driverStatusLog.create({
    data: {
      driver_id: driver2.id,
      status: 'available',
      started_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@delivery.com / admin123');
  console.log('Client: john@example.com / client123');
  console.log('Client: jane@example.com / client123');
  console.log('Driver: mike@example.com / driver123');
  console.log('Driver: sarah@example.com / driver123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
