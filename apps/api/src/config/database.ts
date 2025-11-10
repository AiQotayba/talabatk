// Load environment variables FIRST
import './env';

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Debug: Check environment setup
const debugEnvironment = () => {
  console.log('\n🔍 Environment Debug Information:');
  console.log('================================');

  // Check .env file location
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env'),
  ];

  console.log('\n📁 Checking for .env file:');
  envPaths.forEach(envPath => {
    const exists = fs.existsSync(envPath);
    console.log(`  ${exists ? '✓' : '✗'} ${envPath}`);
    if (exists) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        console.log(`    Found ${lines.length} environment variables`);
      } catch (error) {
        console.log(`    Error reading file: ${error}`);
      }
    }
  });

  // Check DATABASE_URL
  console.log('\n🗄️  DATABASE_URL Status:');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    // Mask password in URL for security
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
    console.log(`  ✓ DATABASE_URL is set`);
    console.log(`  📍 Connection: ${maskedUrl}`);
    console.log(`  📏 Length: ${dbUrl.length} characters`);
  } else {
    console.log('  ✗ DATABASE_URL is NOT set');
    console.log('  ⚠️  This will cause Prisma initialization to fail');
  }

  // Check other important env vars
  console.log('\n🔑 Other Environment Variables:');
  const importantVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'PORT', 'NODE_ENV'];
  importantVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const masked = varName.includes('SECRET') || varName.includes('SECRET')
        ? value.substring(0, 10) + '***'
        : value;
      console.log(`  ✓ ${varName}: ${masked}`);
    } else {
      console.log(`  ✗ ${varName}: NOT SET`);
    }
  });

  console.log('\n📂 Current Working Directory:');
  console.log(`  ${process.cwd()}`);
  console.log('\n📂 __dirname:');
  console.log(`  ${__dirname}`);

  console.log('\n================================\n');
};

// Run debug in development
if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
  debugEnvironment();
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || (() => {
  if (!process.env.DATABASE_URL) {
    console.error('3. For free database: https://neon.tech or https://supabase.com\n');
    throw new Error('DATABASE_URL environment variable is required');
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('\n❌ Failed to initialize Prisma Client:');
    console.error(error);
    throw error;
  }
})();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export default prisma;
