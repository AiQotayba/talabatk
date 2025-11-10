import { Router } from 'express';
import { 
  sendMessage,
  getOrderMessages,
  markAsRead
} from '../controllers/messages.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import Joi from 'joi';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const sendMessageSchema = Joi.object({
  order_id: Joi.string().uuid().optional(),
  to_user: Joi.string().uuid().optional(),
  content: Joi.string().max(1000).optional(),
  message_type: Joi.string().valid('text', 'audio', 'image').optional(),
  attachments: Joi.array().items(Joi.string()).optional(),
}).custom((value, helpers) => {
  // At least one of order_id or to_user must be provided
  if (!value.order_id && !value.to_user) {
    return helpers.error('custom.missingTarget');
  }
  return value;
}).messages({
  'custom.missingTarget': 'Either order_id or to_user is required'
});

const messageIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// Message routes
router.post('/', validate(sendMessageSchema), sendMessage as any);
router.get('/order/:id', validateParams(orderIdSchema), getOrderMessages as any);
router.put('/:id/read', validateParams(messageIdSchema), markAsRead as any);

export default router;
