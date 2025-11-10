import { Router } from 'express';
import { 
  createRating,
  getDriverRatings
} from '../controllers/ratings.controller';
import { authenticateToken, requireClient } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import Joi from 'joi';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const createRatingSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  driver_id: Joi.string().uuid().required(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
});

const driverIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// Rating routes
router.post('/', requireClient as any, validate(createRatingSchema), createRating as any);
router.get('/driver/:id', validateParams(driverIdSchema), getDriverRatings as any);

export default router;
