import { Router } from 'express';
import { 
  getAllOrders,
  getAllDrivers,
  updateDriver,
  getAnalytics,
  getComplaints,
  getDashboardStats,
  getAllUsers,
  getUserById,
  getMap
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import Joi from 'joi';
import { OrderStatus } from '@prisma/client';

const router: Router = Router();

// All routes require admin authentication
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// Validation schemas
const updateDriverSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended', 'pending').optional(),
  notes: Joi.string().max(500).optional(),
});

const driverIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const userIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const ordersQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
  date_from: Joi.date().iso().optional(),
  date_to: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  client_id: Joi.string().uuid().optional(),
  driver_id: Joi.string().uuid().optional(),
});

const driversQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().optional(),
});

const analyticsQuerySchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
});

const complaintsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid('pending', 'resolved', 'dismissed').optional(),
});

const mapQuerySchema = Joi.object({
  status: Joi.string().valid('all', 'pending', 'assigned', 'in_progress', 'delivered', 'cancelled').optional(),
});

// Admin routes
router.get('/dashboard/stats', getDashboardStats as any);
router.get('/orders', validateQuery(ordersQuerySchema), getAllOrders as any);
router.get('/users', getAllUsers as any);
router.get('/users/:id', validateParams(userIdSchema), getUserById as any);
router.get('/drivers', validateQuery(driversQuerySchema), getAllDrivers as any);
router.put('/drivers/:id', validateParams(driverIdSchema), validate(updateDriverSchema), updateDriver as any);
router.get('/analytics', validateQuery(analyticsQuerySchema), getAnalytics as any);
router.get('/complaints', validateQuery(complaintsQuerySchema), getComplaints as any);
router.get('/map', validateQuery(mapQuerySchema), getMap as any);

export default router;
