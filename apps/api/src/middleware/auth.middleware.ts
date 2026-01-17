import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      sendError(res, 'يجب تسجيل الدخول أولاً. يرجى تسجيل الدخول للوصول إلى هذه الصفحة', 401);
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_photo_url: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      sendError(res, 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى', 401);
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    sendError(res, 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى', 401);
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'يجب تسجيل الدخول أولاً. يرجى تسجيل الدخول للوصول إلى هذه الصفحة', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ', 403);
      return;
    }

    next();
  };
};

export const requireClient = requireRole([UserRole.client]);
export const requireDriver = requireRole([UserRole.driver]);
export const requireAdmin = requireRole([UserRole.admin]);
export const requireDriverOrAdmin = requireRole([UserRole.driver, UserRole.admin]);
