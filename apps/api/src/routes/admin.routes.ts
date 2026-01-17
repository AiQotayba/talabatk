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
  getMap,
  getMapDrivers,
  createFeaturedOrder,
  getFeaturedOrders,
  getFeaturedOrderById,
  updateFeaturedOrder,
  deleteFeaturedOrder,
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner
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

const featuredOrderSchema = Joi.object({
  context: Joi.string().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().required(),
  is_active: Joi.boolean().optional(),
});

const updateFeaturedOrderSchema = Joi.object({
  context: Joi.string().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  is_active: Joi.boolean().optional(),
});

const featuredOrderIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const featuredOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  is_active: Joi.boolean().optional(),
});

const bannerSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  image_url: Joi.string().uri().required(),
  link: Joi.string().uri().optional(),
  order_index: Joi.number().integer().min(0).optional(),
  is_active: Joi.boolean().optional(),
});

const updateBannerSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  image_url: Joi.string().uri().optional(),
  link: Joi.string().uri().optional(),
  order_index: Joi.number().integer().min(0).optional(),
  is_active: Joi.boolean().optional(),
});

const bannerIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const bannersQuerySchema = Joi.object({
  is_active: Joi.boolean().optional(),
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
router.get('/map/drivers', getMapDrivers as any);

// Featured Orders routes
router.route('/featured-order')
  .post(validate(featuredOrderSchema), createFeaturedOrder as any)
  .get(validateQuery(featuredOrdersQuerySchema), getFeaturedOrders as any)

router.route('/featured-order/:id')
  .get(validateParams(featuredOrderIdSchema), getFeaturedOrderById as any)
  .put(validateParams(featuredOrderIdSchema), validate(updateFeaturedOrderSchema), updateFeaturedOrder as any)
  .delete(validateParams(featuredOrderIdSchema), deleteFeaturedOrder as any);

// Banners routes
router.route('/banner')
  .post(validate(bannerSchema), createBanner as any)
  .get(validateQuery(bannersQuerySchema), getBanners as any)

router.route('/banner/:id')
  .get(validateParams(bannerIdSchema), getBannerById as any)
  .put(validateParams(bannerIdSchema), validate(updateBannerSchema), updateBanner as any)
  .delete(validateParams(bannerIdSchema), deleteBanner as any);

export default router;
