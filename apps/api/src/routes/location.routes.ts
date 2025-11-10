import { Router } from 'express';
import { 
  updateDriverLocation,
  trackOrder,
  getNearbyDrivers
} from '../controllers/location.controller';
import { authenticateToken, requireDriver } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import Joi from 'joi';
import { DriverStatus } from '@prisma/client';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  status: Joi.string().valid(...Object.values(DriverStatus)).required(),
});

const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const nearbyDriversQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.1).max(100).optional(),
});

// Location routes
router.put('/driver', requireDriver as any, validate(updateLocationSchema), updateDriverLocation as any);
router.get('/order/:id', validateParams(orderIdSchema), trackOrder as any);
router.get('/nearby-drivers', validateQuery(nearbyDriversQuerySchema), getNearbyDrivers as any);

export default router;
