import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { UpdateProfileRequest, CreateAddressRequest, UpdateAddressRequest } from '../types/user.types';
import prisma from '../config/database';

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
      sendError(res, 'لم يتم العثور على المستخدم. يرجى التحقق من بياناتك أو تسجيل الدخول مرة أخرى', 404);
      return;
    }

    sendSuccess(res, user, 'تم تحميل الملف الشخصي بنجاح');
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الملف الشخصي. يرجى المحاولة مرة أخرى', 500);
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

    sendSuccess(res, updatedUser, 'تم تحديث الملف الشخصي بنجاح! تم حفظ التغييرات');
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث الملف الشخصي. يرجى المحاولة مرة أخرى', 500);
  }
};

export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log(req.file);
    
    if (!req.file) {
      sendError(res, 'لم يتم رفع أي صورة. يرجى اختيار صورة للملف الشخصي', 400);
      return;
    }

    const userId = req.user!.id;
    // Get base URL from environment or construct from request
    const baseUrl = process.env.API_BASE_URL || 
      `${req.protocol}://${req.get('host')}`;
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

    sendSuccess(res, updatedUser, 'تم رفع صورة الملف الشخصي بنجاح! تم تحديث صورتك');
  } catch (error) {
    console.error('Upload profile photo error:', error);
    sendError(res, 'حدث خطأ أثناء رفع الصورة. يرجى التأكد من صحة الصورة والمحاولة مرة أخرى', 500);
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

    sendSuccess(res, addresses, 'تم تحميل العناوين بنجاح');
  } catch (error) {
    console.error('Get addresses error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل العناوين. يرجى المحاولة مرة أخرى', 500);
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { 
      city, 
      street, 
      label, 
      lat, 
      lng, 
      is_default, 
      notes,
      // building_number,
      // building_image_url,
      // door_image_url
    }: CreateAddressRequest = req.body;

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
        // building_number: building_number || null,
        // building_image_url: building_image_url || null,
        // door_image_url: door_image_url || null,
      }
    });

    sendSuccess(res, address, 'تم إضافة العنوان بنجاح! يمكنك استخدامه عند إنشاء طلب جديد', 201);
  } catch (error: any) {
    console.error('Create address error:', error);
    // Log more details about the error
    if (error.code === 'P2022' || error.message?.includes('does not exist')) {
      console.error('Database schema mismatch. Please run: npx prisma db push');
      sendError(res, 'حدث خطأ في النظام. يرجى التواصل مع الدعم الفني', 500);
    } else {
      sendError(res, error.message || 'حدث خطأ أثناء إضافة العنوان. يرجى التحقق من البيانات والمحاولة مرة أخرى', 500);
    }
  }
};

export const getAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId, user_id: userId, deleted_at: null },
    });

    sendSuccess(res, address, 'تم تحميل العنوان بنجاح');
  } catch (error) {
    console.error('Get address error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل العنوان. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addressId = req.params.id;
    const { 
      city, 
      street, 
      label, 
      lat, 
      lng, 
      is_default, 
      notes,
      building_number,
      building_image_url,
      door_image_url
    }: UpdateAddressRequest = req.body;

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        user_id: userId,
        deleted_at: null,
      }
    });

    if (!existingAddress) {
      sendError(res, 'لم يتم العثور على العنوان. يرجى التحقق من العنوان أو إضافة عنوان جديد', 404);
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
        ...(building_number !== undefined && { building_number: building_number || null }),
        ...(building_image_url !== undefined && { building_image_url: building_image_url || null }),
        ...(door_image_url !== undefined && { door_image_url: door_image_url || null }),
      }
    });

    sendSuccess(res, updatedAddress, 'تم تحديث العنوان بنجاح! تم حفظ التغييرات');
  } catch (error) {
    console.error('Update address error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث العنوان. يرجى المحاولة مرة أخرى', 500);
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
      sendError(res, 'لم يتم العثور على العنوان. يرجى التحقق من العنوان', 404);
      return;
    }

    // Soft delete
    await prisma.address.update({
      where: { id: addressId },
      data: { deleted_at: new Date() }
    });

    sendSuccess(res, null, 'تم حذف العنوان بنجاح');
  } catch (error) {
    console.error('Delete address error:', error);
    sendError(res, 'حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getFeaturedOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    
    // Get active featured orders that are within their date range
    const featuredOrders = await prisma.featuredOrder.findMany({
      where: {
        is_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      orderBy: { created_at: 'desc' },
      take: 5, // Last 5 as specified
    });

    sendSuccess(res, featuredOrders, 'تم تحميل الطلبات المميزة بنجاح');
  } catch (error) {
    console.error('Get featured orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الطلبات المميزة. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getBannersUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        is_active: true,
      },
      orderBy: { order_index: 'asc' },
    });

    sendSuccess(res, banners, 'تم تحميل الإعلانات بنجاح');
  } catch (error) {
    console.error('Get banners error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الإعلانات. يرجى المحاولة مرة أخرى', 500);
  }
};
