import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول والمحاولة مرة أخرى';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'يجب تسجيل الدخول أولاً. يرجى تسجيل الدخول للوصول إلى هذه الصفحة';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صحيح. يرجى التحقق من المعرف والمحاولة مرة أخرى';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? error.stack : undefined);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'الصفحة المطلوبة غير موجودة. يرجى التحقق من الرابط والمحاولة مرة أخرى', 404);
};
