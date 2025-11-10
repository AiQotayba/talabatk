#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Delivery App API...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/delivery_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=10

# CORS
CORS_ORIGIN="*"

# Socket.io
SOCKET_CORS_ORIGIN="*"
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Check if database is accessible
console.log('\n🗄️  Checking database connection...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema created');
} catch (error) {
  console.log('⚠️  Database connection failed. Please check your DATABASE_URL in .env');
  console.log('💡 You can use Docker to start PostgreSQL:');
  console.log('   docker run --name delivery-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=delivery_app -p 5432:5432 -d postgres:13');
}

// Seed database
console.log('\n🌱 Seeding database...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded with sample data');
} catch (error) {
  console.log('⚠️  Database seeding failed. You can run it later with: npm run seed');
}

console.log('\n🎉 Setup complete!');
console.log('\n📚 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Visit API documentation: http://localhost:3000/api/docs');
console.log('3. Test health endpoint: http://localhost:3000/health');
console.log('\n👤 Sample users (after seeding):');
console.log('   Admin: admin@deliveryapp.com / admin123');
console.log('   Client: client@deliveryapp.com / client123');
console.log('   Driver: driver@deliveryapp.com / driver123');
