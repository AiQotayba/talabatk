import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    getAddress
} from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import { uploadProfilePhoto as uploadMiddleware } from '../middleware/upload.middleware';
import Joi from 'joi';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// Validation schemas
const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    profile_photo_url: Joi.string().uri().optional(),
});

const createAddressSchema = Joi.object({
    city: Joi.string().min(2).max(100).required(),
    street: Joi.string().min(2).max(200).required(),
    label: Joi.string().min(2).max(50).required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    is_default: Joi.boolean().optional(),
    notes: Joi.string().max(500).optional().allow('', null),
    building_number: Joi.string().max(50).optional().allow('', null),
    building_image_url: Joi.string().optional().allow('', null), // Allow file:// URIs from mobile
    door_image_url: Joi.string().optional().allow('', null), // Allow file:// URIs from mobile
});

const updateAddressSchema = Joi.object({
    city: Joi.string().min(2).max(100).optional(),
    street: Joi.string().min(2).max(200).optional(),
    label: Joi.string().min(2).max(50).optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    is_default: Joi.boolean().optional(),
    notes: Joi.string().max(500).optional().allow('', null),
    building_number: Joi.string().max(50).optional().allow('', null),
    building_image_url: Joi.string().optional().allow('', null), // Allow file:// URIs from mobile
    door_image_url: Joi.string().optional().allow('', null), // Allow file:// URIs from mobile
});

const addressIdSchema = Joi.object({
    id: Joi.string().uuid().required(),
});

// Profile routes
router.get('/profile', getProfile as any);
router.put('/profile', validate(updateProfileSchema), updateProfile as any);
router.post('/profile-photo', uploadMiddleware, uploadProfilePhoto as any);

// Address routes
router.get('/addresses', getAddresses as any);
router.post('/addresses', validate(createAddressSchema), createAddress as any);
router.get('/addresses/:id', validateParams(addressIdSchema), getAddress as any);
router.put('/addresses/:id', validateParams(addressIdSchema), validate(updateAddressSchema), updateAddress as any);
router.delete('/addresses/:id', validateParams(addressIdSchema), deleteAddress as any);

export default router;
