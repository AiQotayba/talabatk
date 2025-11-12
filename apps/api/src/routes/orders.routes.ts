import { Router } from 'express';
import {
    createOrder,
    getOrder,
    updateOrderStatus,
    getClientOrderHistory,
    getDriverPendingOrders,
    getDriverOrderHistory,
    acceptOrder,
    rejectOrder,
    uploadProof,
    getAll
} from '../controllers/orders.controller';
import { authenticateToken, requireClient, requireDriver } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { uploadProofPhotos } from '../middleware/upload.middleware';
import Joi from 'joi';
import { OrderStatus } from '@prisma/client';

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
});

// Order routes
router.get('/', requireClient as any, getAll as any);
router.post('/', requireClient as any, validate(createOrderSchema), createOrder as any);
router.get('/:id', validateParams(orderIdSchema), getOrder as any);
router.put('/:id/status', validateParams(orderIdSchema), validate(updateOrderStatusSchema), updateOrderStatus as any);

// Client routes
router.get('/client/history', requireClient as any, validateQuery(orderHistoryQuerySchema), getClientOrderHistory as any);

// Driver routes
router.get('/driver/pending', requireDriver as any, getDriverPendingOrders as any);
router.get('/driver/history', requireDriver as any, validateQuery(orderHistoryQuerySchema), getDriverOrderHistory as any);
router.post('/:id/accept', requireDriver as any, validateParams(orderIdSchema), acceptOrder as any);
router.post('/:id/reject', requireDriver as any, validateParams(orderIdSchema), rejectOrder as any);
router.post('/:id/proof', requireDriver as any, validateParams(orderIdSchema), uploadProofPhotos, uploadProof as any);

export default router;
