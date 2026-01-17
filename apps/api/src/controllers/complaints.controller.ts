import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import prisma from '../config/database';

export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!.id;
    const { order_id, description, photo_urls = [] }: {
      order_id: string;
      description?: string;
      photo_urls?: string[];
    } = req.body;

    // Verify order exists and belongs to client
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        client: true,
        driver: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    if (order.client_id !== clientId) {
      sendError(res, 'ليس لديك صلاحية لإرسال شكوى لهذا الطلب. يمكنك فقط إرسال شكاوى لطلباتك الخاصة', 403);
      return;
    }

    // Check if complaint already exists for this order
    const existingComplaint = await prisma.complaint.findFirst({
      where: { order_id }
    });

    if (existingComplaint) {
      sendError(res, 'تم إرسال شكوى لهذا الطلب مسبقاً. يمكنك إرسال شكوى واحدة لكل طلب', 400);
      return;
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        order_id,
        client_id: clientId,
        description,
        photo_urls,
        status: 'pending',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        order: {
          select: {
            id: true,
            content: true,
            status: true,
            created_at: true,
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
              }
            }
          }
        }
      }
    });

    sendSuccess(res, complaint, 'تم إرسال الشكوى بنجاح! سيتم مراجعتها من قبل فريق الدعم قريباً');
  } catch (error) {
    console.error('Create complaint error:', error);
    sendError(res, 'حدث خطأ أثناء إرسال الشكوى. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const complaintId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          }
        },
        order: {
          select: {
            id: true,
            content: true,
            status: true,
            created_at: true,
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
              }
            }
          }
        }
      }
    });

    if (!complaint) {
      sendError(res, 'لم يتم العثور على الشكوى. يرجى التحقق من رقم الشكوى', 404);
      return;
    }

    // Check permissions
    if (userRole === 'client' && complaint.client_id !== userId) {
      sendError(res, 'ليس لديك صلاحية لعرض هذه الشكوى. يمكنك فقط عرض شكاويك الخاصة', 403);
      return;
    }

    sendSuccess(res, complaint, 'تم تحميل تفاصيل الشكوى بنجاح');
  } catch (error) {
    console.error('Get complaint error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل تفاصيل الشكوى. يرجى المحاولة مرة أخرى', 500);
  }
};
