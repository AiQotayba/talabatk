import { Router } from 'express';
import { 
  createComplaint,
  getComplaint
} from '../controllers/complaints.controller';
import { authenticateToken, requireClient } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import Joi from 'joi';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const createComplaintSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional(),
  photo_urls: Joi.array().items(Joi.string().uri()).optional(),
});

const complaintIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// Complaint routes
router.post('/', requireClient as any, validate(createComplaintSchema), createComplaint as any);
router.get('/:id', validateParams(complaintIdSchema), getComplaint as any);

export default router;
