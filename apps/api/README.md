# 🚚 Delivery App API

Express.js REST API with TypeScript, Socket.io, Prisma ORM, and PostgreSQL for a delivery application.

## 🚀 Features

- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: Profile, addresses, photo uploads
- **Order Management**: Create, track, accept/reject orders
- **Real-time Features**: Socket.io for live tracking and messaging
- **Location Services**: Driver location updates and nearby driver search
- **Messaging**: Real-time chat between clients and drivers
- **Ratings & Complaints**: Rate drivers and file complaints
- **Admin Panel**: Analytics, driver management, order oversight
- **File Uploads**: Profile photos, proof images, complaint photos

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Joi
- **Documentation**: Swagger

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or pnpm

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd delivery-app-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/delivery_app"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   PORT=3000
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run migrations
   npm run migrate
   
   # (Optional) Seed database
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/health`

## 🏗️ Project Structure

```
src/
├── controllers/     # Route handlers
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── orders.controller.ts
│   ├── location.controller.ts
│   ├── messages.controller.ts
│   ├── ratings.controller.ts
│   ├── complaints.controller.ts
│   └── admin.controller.ts
├── routes/         # API routes
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── orders.routes.ts
│   ├── location.routes.ts
│   ├── messages.routes.ts
│   ├── ratings.routes.ts
│   ├── complaints.routes.ts
│   └── admin.routes.ts
├── middleware/     # Custom middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── upload.middleware.ts
├── utils/          # Helper functions
│   ├── jwt.util.ts
│   ├── bcrypt.util.ts
│   ├── validation.util.ts
│   └── response.util.ts
├── types/          # TypeScript types
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── order.types.ts
│   └── common.types.ts
├── config/         # Configuration
│   ├── database.ts
│   ├── jwt.ts
│   └── app.ts
├── socket/         # Socket.io handlers
│   ├── socket.handlers.ts
│   └── socket.middleware.ts
└── app.ts          # Main application
```

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** to get access and refresh tokens
2. **Include token** in Authorization header: `Bearer <access_token>`
3. **Refresh token** when access token expires

### User Roles
- `client`: Can create orders, rate drivers, file complaints
- `driver`: Can accept orders, update location, upload proof
- `admin`: Full access to all endpoints and analytics

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile-photo` - Upload profile photo
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Create address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

### Orders
- `POST /api/orders` - Create order (client only)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/client/history` - Get client order history
- `GET /api/orders/driver/pending` - Get pending orders (driver only)
- `POST /api/orders/:id/accept` - Accept order (driver only)
- `POST /api/orders/:id/reject` - Reject order (driver only)
- `POST /api/orders/:id/proof` - Upload proof photos (driver only)

### Location & Tracking
- `PUT /api/location/driver` - Update driver location (driver only)
- `GET /api/location/order/:id` - Track order
- `GET /api/location/nearby-drivers` - Find nearby drivers

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/order/:id` - Get order messages
- `PUT /api/messages/:id/read` - Mark message as read

### Ratings & Complaints
- `POST /api/ratings` - Create rating (client only)
- `GET /api/ratings/driver/:id` - Get driver ratings
- `POST /api/complaints` - Create complaint (client only)
- `GET /api/complaints/:id` - Get complaint details

### Admin
- `GET /api/admin/orders` - Get all orders with filtering
- `GET /api/admin/drivers` - Get all drivers
- `PUT /api/admin/drivers/:id` - Update driver status
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/complaints` - Get all complaints

## 🔌 Socket.io Events

### Client Events
- `join_order_room` - Join order conversation room
- `leave_order_room` - Leave order conversation room
- `send_message` - Send real-time message
- `update_location` - Update driver location (drivers only)
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server Events
- `order_created` - New order created
- `order_assigned` - Order assigned to driver
- `order_status_updated` - Order status changed
- `driver_location_updated` - Driver location updated
- `message_received` - New message received
- `user_joined_order` - User joined order room
- `user_left_order` - User left order room
- `user_typing` - User typing indicator

## 🚀 Deployment

### Using PM2

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Monitor**
   ```bash
   pm2 monit
   pm2 logs
   ```

### Using Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MAX_FILE_SIZE` | Max upload file size (bytes) | 5242880 |
| `UPLOAD_PATH` | File upload directory | ./uploads |
| `CORS_ORIGIN` | CORS allowed origins | * |

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on endpoints
- Input validation with Joi
- File upload restrictions
- CORS configuration
- Helmet security headers

## 📊 Database Schema

The API uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Clients, drivers, and admins
- **Order**: Delivery orders with status tracking
- **Address**: User saved addresses
- **Message**: Real-time messaging
- **Rating**: Driver ratings and reviews
- **Complaint**: User complaints
- **DriverStatusLog**: Driver status history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the logs for error details

---

**Happy coding! 🚀**
