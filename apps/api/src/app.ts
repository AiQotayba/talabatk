// Load environment variables FIRST - before any other imports
import './config/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import ordersRoutes from './routes/orders.routes';
import locationRoutes from './routes/location.routes';
import messagesRoutes from './routes/messages.routes';
import ratingsRoutes from './routes/ratings.routes';
import complaintsRoutes from './routes/complaints.routes';
import adminRoutes from './routes/admin.routes';

// Import socket handlers
import { setupSocketHandlers } from './socket/socket.handlers';

// Import config
import { appConfig } from './config/app';

const app: express.Application = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: appConfig.socket.corsOrigin,
    methods: ["GET", "POST"]
  }
});

// Make io available globally
app.set('io', io);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery App API',
      version: '1.0.0',
      description: 'Express.js REST API with TypeScript, Socket.io, Prisma ORM, and PostgreSQL for a delivery application',
      contact: {
        name: 'API Support',
        email: 'support@deliveryapp.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Delivery App API Documentation',
}));

// Middleware
app.use(helmet());
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.io setup
setupSocketHandlers(io);

// Start server
const PORT = appConfig.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${appConfig.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
