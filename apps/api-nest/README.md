# Delivery App Backend API

A comprehensive backend API for a delivery application built with NestJS, PostgreSQL, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Profile management and address CRUD operations
- **Order Management**: Complete order lifecycle with status tracking
- **Real-time Communication**: Socket.io for live updates and messaging
- **Location Tracking**: Driver location updates and nearby driver search
- **Rating & Complaints**: Order ratings and complaint system
- **Admin Dashboard**: Analytics, order management, and driver management
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit and e2e tests with Jest
- **Docker Support**: Complete containerization setup
- **CI/CD**: GitHub Actions workflows

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Real-time**: Socket.io
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker
- **Process Management**: PM2
- **Web Server**: Nginx

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd delivery-app-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_db"
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
```

### 4. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 5. Start the application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🐳 Docker Setup

### Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build the image
docker build -t delivery-api .

# Run the container
docker run -p 3000:3000 --env-file .env delivery-api
```

## 📚 API Documentation

Once the application is running, visit:

- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/          # Exception filters
│   ├── guards/           # Auth guards
│   ├── interceptors/     # Response interceptors
│   └── services/         # Shared services
├── config/               # Configuration
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── orders/          # Order management
│   ├── location/        # Location tracking
│   ├── messages/        # Messaging
│   ├── ratings/         # Rating system
│   ├── complaints/      # Complaint system
│   └── admin/           # Admin panel
├── gateways/            # Socket.io gateways
├── health/              # Health checks
└── main.ts             # Application entry point
```

## 🔐 Authentication

The API uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/verify-phone` - Phone verification

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Clients, drivers, and admins
- **Orders**: Delivery orders with status tracking
- **Addresses**: User addresses for pickup/delivery
- **Messages**: Real-time chat between users
- **Ratings**: Order ratings and feedback
- **Complaints**: Order complaints and issues

## 🚀 Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Using Nginx

Copy the `nginx.conf` to your Nginx configuration directory and update the server name and SSL certificates.

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/verify-phone` - Verify phone number

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Create address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/history` - Get order history
- `GET /api/orders/pending` - Get pending orders (driver)
- `POST /api/orders/:id/accept` - Accept order (driver)
- `POST /api/orders/:id/reject` - Reject order (driver)

### Location
- `PUT /api/location/update` - Update driver location
- `GET /api/location/track/:orderId` - Track order location
- `GET /api/location/nearby-drivers` - Get nearby drivers

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/order/:orderId` - Get order conversation
- `PUT /api/messages/:id/read` - Mark message as read

### Ratings & Complaints
- `POST /api/ratings` - Create rating
- `POST /api/complaints` - Create complaint

### Admin
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/drivers` - Get all drivers
- `PUT /api/admin/drivers/:id` - Update driver status
- `GET /api/admin/analytics` - Get analytics data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please open an issue or contact the development team.

---

Made with ❤️ by the Delivery App Team