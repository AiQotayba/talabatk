import { Router } from 'express';
import {
    createOrder,
    getOrder,
    updateOrderStatus,
    getClientOrderHistory,
    getDriverPendingOrders,
    getDriverOrders,
    getDriverOrderHistory,
    acceptOrder,
    rejectOrder,
    uploadProof,
    getAll,
    updateOrderAddress,
    reactivateOrder,
    updateOrderContent,
    updateOrderPrice,
    getOrderQRCode,
    scanOrderQRCode
} from '../controllers/orders.controller';
import { authenticateToken, requireClient, requireDriver, requireAdmin } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { uploadProofPhotos } from '../middleware/upload.middleware';
import { OrderStatus } from '@prisma/client';
import Joi from 'joi';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const createOrderSchema = Joi.object({
    content: Joi.string().min(5).max(1000).required(),
    dropoff_address_id: Joi.string().uuid().required(),
    payment_method: Joi.string().valid('cash', 'card').optional(),
    pickup_lat: Joi.number().min(-90).max(90).optional(),
    pickup_lng: Joi.number().min(-180).max(180).optional(),
});

const updateOrderAddressSchema = Joi.object({
    dropoff_address_id: Joi.string().uuid().required(),
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).required(),
    pickup_lat: Joi.number().min(-90).max(90).optional(),
    pickup_lng: Joi.number().min(-180).max(180).optional(),
});

const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required(),
});

const orderHistoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
});

const driverOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('all', 'pending', 'assigned', 'accepted', 'active', ...Object.values(OrderStatus)).optional(),
});

// Order routes - Specific routes must come before parameterized routes
router.get('/', getAll as any);
// router.get('/', requireClient as any, getAll as any);
router.post('/', requireClient as any, validate(createOrderSchema), createOrder as any);

// Client routes - Specific routes first
router.get('/client/history', requireClient as any, validateQuery(orderHistoryQuerySchema), getClientOrderHistory as any);

// Driver routes - Specific routes first
router.get('/driver', requireDriver as any, validateQuery(driverOrdersQuerySchema), getDriverOrders as any);
router.get('/driver/pending', requireDriver as any, getDriverPendingOrders as any); // Keep for backward compatibility
router.get('/driver/history', requireDriver as any, validateQuery(orderHistoryQuerySchema), getDriverOrderHistory as any);

// Scan QR route - Specific route
router.post('/scan-qr', validate(Joi.object({ code: Joi.string().required() })), scanOrderQRCode as any);

// Parameterized routes - Must come after all specific routes
router.get('/:id', validateParams(orderIdSchema), getOrder as any);
router.put('/:id/status', requireDriver as any, validateParams(orderIdSchema), validate(updateOrderStatusSchema), updateOrderStatus as any);
router.put('/:id/address', requireClient as any, validateParams(orderIdSchema), validate(updateOrderAddressSchema), updateOrderAddress as any);
router.post('/:id/reactivate', validateParams(orderIdSchema), reactivateOrder as any);
router.put('/:id/content', requireAdmin as any, validateParams(orderIdSchema), validate(Joi.object({ content: Joi.string().min(5).max(1000).required() })), updateOrderContent as any);
router.put('/:id/price', requireAdmin as any, validateParams(orderIdSchema), validate(Joi.object({ price: Joi.number().min(0).required() })), updateOrderPrice as any);
router.get('/:id/qr-code', validateParams(orderIdSchema), getOrderQRCode as any);
router.post('/:id/accept', requireDriver as any, validateParams(orderIdSchema), acceptOrder as any);
router.post('/:id/reject', requireDriver as any, validateParams(orderIdSchema), rejectOrder as any);
router.post('/:id/proof', requireDriver as any, validateParams(orderIdSchema), uploadProofPhotos, uploadProof as any);

export default router;
