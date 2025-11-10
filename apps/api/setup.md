# 🚀 Quick Setup Guide

## 1. Environment Setup

Create a `.env` file in the root directory with the following content:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/delivery_app"

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
```

## 2. Database Setup

### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name delivery-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=delivery_app -p 5432:5432 -d postgres:13

# Update DATABASE_URL in .env to:
DATABASE_URL="postgresql://postgres:password@localhost:5432/delivery_app"
```

### Option B: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `delivery_app`
3. Update the DATABASE_URL in `.env` with your credentials

## 3. Run Setup Commands

```bash
# Install dependencies (if not already done)
npm install

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# (Optional) Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

## 4. Verify Setup

- **API Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api/docs
- **Sample Users** (after seeding):
  - Admin: admin@deliveryapp.com / admin123
  - Client: client@deliveryapp.com / client123
  - Driver: driver@deliveryapp.com / driver123

## 5. Test the API

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "client"
  }'
```

## Troubleshooting

### Prisma Client Error
If you get "Cannot find module '.prisma/client/default'":
```bash
npm run generate
```

### Database Connection Error
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Ensure database exists

### Port Already in Use
Change PORT in `.env` to a different port (e.g., 3001)
