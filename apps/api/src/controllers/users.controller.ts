import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { UpdateProfileRequest, CreateAddressRequest, UpdateAddressRequest } from '../types/user.types';
import prisma from '../config/database';
import path from 'path';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phone_verified: true,
        role: true,
        profile_photo_url: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'Failed to retrieve profile', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, profile_photo_url }: UpdateProfileRequest = req.body;
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(profile_photo_url && { profile_photo_url }),
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_photo_url: true,
        updated_at: true,
      }
    });

    sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Failed to update profile', 500);
  }
};

export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const userId = req.user!.id;
    const filePath = `/uploads/profiles/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profile_photo_url: filePath,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_photo_url: true,
        updated_at: true,
      }
    });

    sendSuccess(res, updatedUser, 'Profile photo uploaded successfully');
  } catch (error) {
    console.error('Upload profile photo error:', error);
    sendError(res, 'Failed to upload profile photo', 500);
  }
};

export const getAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' }
      ]
    });

    sendSuccess(res, addresses, 'Addresses retrieved successfully');
  } catch (error) {
    console.error('Get addresses error:', error);
    sendError(res, 'Failed to retrieve addresses', 500);
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { city, street, label, lat, lng, is_default, notes }: CreateAddressRequest = req.body;

    // If this is set as default, unset other defaults
    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        user_id: userId,
        city,
        street,
        label,
        lat,
        lng,
        is_default: is_default || false,
        notes,
      }
    });

    sendSuccess(res, address, 'Address created successfully', 201);
  } catch (error) {
    console.error('Create address error:', error);
    sendError(res, 'Failed to create address', 500);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const { city, street, label, lat, lng, is_default, notes }: UpdateAddressRequest = req.body;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        user_id: userId,
        deleted_at: null,
      }
    });

    if (!existingAddress) {
      sendError(res, 'Address not found', 404);
      return;
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(city && { city }),
        ...(street && { street }),
        ...(label && { label }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(is_default !== undefined && { is_default }),
        ...(notes !== undefined && { notes }),
      }
    });

    sendSuccess(res, updatedAddress, 'Address updated successfully');
  } catch (error) {
    console.error('Update address error:', error);
    sendError(res, 'Failed to update address', 500);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        user_id: userId,
        deleted_at: null,
      }
    });

    if (!existingAddress) {
      sendError(res, 'Address not found', 404);
      return;
    }

    // Soft delete
    await prisma.address.update({
      where: { id: addressId },
      data: { deleted_at: new Date() }
    });

    sendSuccess(res, null, 'Address deleted successfully');
  } catch (error) {
    console.error('Delete address error:', error);
    sendError(res, 'Failed to delete address', 500);
  }
};
