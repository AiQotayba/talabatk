import { Response } from 'express';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderHistoryQuery } from '../types/order.types';
import prisma from '../config/database';
import { OrderStatus, UserRole } from '@prisma/client';
import { Server } from 'socket.io';
// import QRCode from 'qrcode';

// Helper function to serialize order BigInt fields for JSON
const serializeOrder = (order: any): any => ({
  ...order,
  price_cents: Number(order.price_cents),
});

const serializeOrders = (orders: any[]): any[] => {
  return orders.map(serializeOrder);
};

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { content, dropoff_address_id, payment_method = 'cash', pickup_lat, pickup_lng }: CreateOrderRequest = req.body;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: dropoff_address_id,
        user_id: userId,
        deleted_at: null,
      }
    });

    if (!address) {
      sendError(res, 'لم يتم العثور على العنوان. يرجى إضافة عنوان جديد من إعدادات الملف الشخصي', 404);
      return;
    }

    // Generate order code based on total order count
    const totalOrders = await prisma.order.count();
    const orderNumber = totalOrders + 1;
    const codeOrder = `ORD-${String(orderNumber).padStart(6, '0')}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        client_id: userId,
        content,
        dropoff_address_id,
        payment_method,
        status: OrderStatus.pending,
        code_order: codeOrder,
        ...(pickup_lat !== undefined && pickup_lng !== undefined && {
          pickup_lat,
          pickup_lng,
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Emit socket event
    const io: Server = req.app.get('io');
    io.emit('order_created', serializeOrder(order));

    sendSuccess(res, serializeOrder(order), 'تم إنشاء الطلب بنجاح! سيتم تعيين سائق للطلب قريباً', 201);
  } catch (error) {
    console.error('Create order error:', error);
    sendError(res, 'حدث خطأ أثناء إنشاء الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى', 500);
  }
};

export const getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const where: any = {};

    // Filter by user role
    if (userRole === UserRole.client) {
      where.client_id = userId;
    } else if (userRole === UserRole.driver) {
      where.driver_id = userId;
    }
    // Admin can see all orders, so no filter needed

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      },
      orderBy: { created_at: 'desc' },
    });

    sendSuccess(res, serializeOrders(orders), 'تم تحميل الطلبات بنجاح');
  } catch (error) {
    console.error('Get orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
        messages: {
          orderBy: { created_at: 'asc' },
          take: 10,
        },
        ratings: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Check permissions
    if (userRole === UserRole.client && order.client_id !== userId) {
      sendError(res, 'ليس لديك صلاحية للوصول إلى هذا الطلب. يمكنك فقط عرض طلباتك الخاصة', 403);
      return;
    }
    if (userRole === UserRole.driver && order.driver_id !== userId) {
      sendError(res, 'ليس لديك صلاحية للوصول إلى هذا الطلب. يمكنك فقط عرض الطلبات المخصصة لك', 403);
      return;
    }

    sendSuccess(res, serializeOrder(order), 'تم تحميل تفاصيل الطلب بنجاح');
  } catch (error) {
    console.error('Get order error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل تفاصيل الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { status, pickup_lat, pickup_lng }: UpdateOrderStatusRequest = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        driver: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Validate status transitions based on user role
    const validTransitions: Record<UserRole, OrderStatus[]> = {
      [UserRole.client]: [OrderStatus.cancelled],
      [UserRole.driver]: [OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit, OrderStatus.delivered],
      [UserRole.admin]: Object.values(OrderStatus),
    };

    if (!validTransitions[userRole].includes(status)) {
      sendError(res, 'لا يمكنك تحديث حالة الطلب بهذه الطريقة. يرجى التحقق من الصلاحيات المتاحة لدورك', 400);
      return;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.picked_up && {
          actual_pickup_at: new Date(),
          ...(pickup_lat !== undefined && pickup_lng !== undefined && {
            pickup_lat,
            pickup_lng,
          }),
        }),
        ...(status === OrderStatus.delivered && { delivered_at: new Date() }),
        ...(status === OrderStatus.cancelled && { cancelled_at: new Date() }),
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Create status update message
    const statusMessages: Record<OrderStatus, string> = {
      [OrderStatus.pending]: 'تم تعليق الطلب - سيتم تعيين سائق قريباً',
      [OrderStatus.assigned]: 'تم تعيين سائق للطلب - يمكنك التواصل مع السائق من خلال المحادثة',
      [OrderStatus.accepted]: 'قبل السائق الطلب - سيبدأ في تنفيذ الطلب قريباً',
      [OrderStatus.picked_up]: 'تم استلام الطلب من قبل السائق - الطلب في الطريق إليك',
      [OrderStatus.in_transit]: 'الطلب قيد التوصيل - يمكنك متابعة موقع السائق على الخريطة',
      [OrderStatus.delivered]: 'تم تسليم الطلب بنجاح - شكراً لاستخدامك خدماتنا! يمكنك تقييم السائق',
      [OrderStatus.cancelled]: 'تم إلغاء الطلب - يمكنك إنشاء طلب جديد إذا أردت',
      [OrderStatus.failed]: 'فشل تنفيذ الطلب - يرجى التواصل مع الدعم الفني أو إنشاء طلب جديد',
    };

    // Determine recipient
    const recipientId = userRole === UserRole.client ? order.driver_id : order.client_id;

    // Create system message for status update
    if (recipientId) {
      await prisma.message.create({
        data: {
          order_id: orderId,
          from_user: userId,
          to_user: recipientId,
          content: statusMessages[status] || `تم تحديث حالة الطلب إلى: ${status}`,
          message_type: 'system',
          is_read: false,
        },
      });
    }

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_status_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم تحديث حالة الطلب بنجاح! تم إشعار الطرف الآخر بالتحديث');
  } catch (error) {
    console.error('Update order status error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getClientOrderHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status, date_from, date_to }: OrderHistoryQuery = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      client_id: userId,
      ...(status && { status }),
    };

    // Add date filtering
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.created_at.lte = new Date(date_to as string);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          },
          address: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, serializeOrders(orders), {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Order history retrieved successfully');
  } catch (error) {
    console.error('Get client order history error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل سجل الطلبات. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getDriverOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, page = 1, limit = 50 } = req.query;

    // Get driver's current location and permissions (if available)
    const driver = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true }
    });

    // Extract permissions from metadata (if exists)
    const driverMetadata = driver?.metadata as any;
    const permissions = driverMetadata?.permissions || [];
    const allowedOrderTypes = driverMetadata?.allowed_order_types || [];
    const restrictedAreas = driverMetadata?.restricted_areas || [];

    // Build where clause
    const where: any = {};

    // Filter by status if provided
    if (status) {
      if (status === 'all') {
        // Show all orders (pending, assigned, accepted, etc.)
        where.status = {
          in: [OrderStatus.pending, OrderStatus.assigned, OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit]
        };
      } else if (status === 'pending') {
        where.status = OrderStatus.pending;
      } else if (status === 'assigned') {
        where.status = OrderStatus.assigned;
      } else if (status === 'accepted') {
        where.status = OrderStatus.accepted;
      } else if (status === 'active') {
        // Active orders (accepted, picked_up, in_transit)
        where.status = {
          in: [OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit]
        };
      } else {
        // Use the status directly if it's a valid OrderStatus
        where.status = status as OrderStatus;
      }
    } else {
      // Default: show pending orders only (for backward compatibility)
      where.status = OrderStatus.pending;
    }

    // Filter by permissions if they exist
    if (permissions.length > 0 || allowedOrderTypes.length > 0) {
      // If driver has specific permissions, only show orders that match
      // For now, we'll show all orders if no specific restrictions
      // This can be extended based on business logic
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          },
          address: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, serializeOrders(orders), {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Driver orders retrieved successfully');
  } catch (error) {
    console.error('Get driver orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل طلبات السائق. يرجى المحاولة مرة أخرى', 500);
  }
};

// Keep the old function for backward compatibility
export const getDriverPendingOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get driver's current location and permissions (if available)
    const driver = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true }
    });

    // Extract permissions from metadata (if exists)
    const driverMetadata = driver?.metadata as any;
    const permissions = driverMetadata?.permissions || [];
    const allowedOrderTypes = driverMetadata?.allowed_order_types || [];
    const restrictedAreas = driverMetadata?.restricted_areas || [];

    // Build where clause
    const where: any = {
      status: OrderStatus.pending,
    };

    // Filter by permissions if they exist
    if (permissions.length > 0 || allowedOrderTypes.length > 0) {
      // If driver has specific permissions, only show orders that match
      // For now, we'll show all orders if no specific restrictions
      // This can be extended based on business logic
    }

    const pendingOrders = await prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      },
      orderBy: { created_at: 'asc' },
    });

    sendSuccess(res, serializeOrders(pendingOrders), 'تم تحميل الطلبات المعلقة بنجاح. يمكنك قبول أي طلب متاح');
  } catch (error) {
    console.error('Get driver pending orders error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل الطلبات المعلقة. يرجى المحاولة مرة أخرى', 500);
  }
};

export const acceptOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const driverId = req.user!.id;

    // Check if order is available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    if (order.status !== OrderStatus.pending) {
      sendError(res, 'هذا الطلب لم يعد متاحاً. تم تعيينه لسائق آخر أو تم إلغاؤه', 400);
      return;
    }

    if (order.driver_id) {
      sendError(res, 'تم تعيين هذا الطلب لسائق آخر بالفعل. يرجى اختيار طلب آخر', 400);
      return;
    }

    // Accept order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        driver_id: driverId,
        status: OrderStatus.assigned,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Emit socket events
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.emit('order_assigned', serializedOrder);
    io.to(`order_${orderId}`).emit('order_status_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم قبول الطلب بنجاح! يمكنك الآن البدء في تنفيذ الطلب');
  } catch (error) {
    console.error('Accept order error:', error);
    sendError(res, 'حدث خطأ أثناء قبول الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const rejectOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const driverId = req.user!.id;

    // Check if order is assigned to this driver
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    if (order.driver_id !== driverId) {
      sendError(res, 'هذا الطلب غير مخصص لك. يمكنك فقط رفض الطلبات المخصصة لك', 400);
      return;
    }

    if (order.status !== OrderStatus.assigned) {
      sendError(res, 'لا يمكن رفض الطلب في حالته الحالية. يمكن رفض الطلبات المخصصة فقط', 400);
      return;
    }

    // Reject order (remove driver assignment)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        driver_id: null,
        status: OrderStatus.pending,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.emit('order_assigned', serializedOrder);
    io.to(`order_${orderId}`).emit('order_status_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم رفض الطلب بنجاح. سيتم إعادة الطلب إلى قائمة الطلبات المعلقة');
  } catch (error) {
    console.error('Reject order error:', error);
    sendError(res, 'حدث خطأ أثناء رفض الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const uploadProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const driverId = req.user!.id;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      sendError(res, 'لم يتم رفع أي صور. يرجى اختيار صورة واحدة على الأقل كدليل على التسليم', 400);
      return;
    }

    // Check if order is assigned to this driver
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    if (order.driver_id !== driverId) {
      sendError(res, 'هذا الطلب غير مخصص لك. يمكنك فقط رفع صور الدليل للطلبات المخصصة لك', 400);
      return;
    }

    // Add proof URLs to order
    // Get base URL from environment or construct from request
    const baseUrl = process.env.API_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const proofUrls = req.files.map((file: any) => `${baseUrl}/uploads/proofs/${file.filename}`);
    const updatedProofUrls = [...(order.proof_urls || []), ...proofUrls];

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        proof_urls: updatedProofUrls,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم رفع صور الدليل بنجاح! تم إشعار العميل بالصور');
  } catch (error) {
    console.error('Upload proof error:', error);
    sendError(res, 'حدث خطأ أثناء رفع الصور. يرجى التأكد من صحة الصور والمحاولة مرة أخرى', 500);
  }
};

export const getDriverOrderHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.user!.id;
    const { page = 1, limit = 10, status }: OrderHistoryQuery = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      driver_id: driverId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              profile_photo_url: true,
            }
          },
          address: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    sendPaginatedSuccess(res, serializeOrders(orders), {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    }, 'Driver order history retrieved successfully');
  } catch (error) {
    console.error('Get driver order history error:', error);
    sendError(res, 'حدث خطأ أثناء تحميل سجل طلبات السائق. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateOrderAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { dropoff_address_id } = req.body;
    const userId = req.user!.id;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    if (order.client_id !== userId) {
      sendError(res, 'ليس لديك صلاحية لتعديل هذا الطلب. يمكنك فقط تعديل طلباتك الخاصة', 403);
      return;
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: dropoff_address_id,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!address) {
      sendError(res, 'لم يتم العثور على العنوان أو أنه لا ينتمي إليك. يرجى إضافة عنوان جديد من إعدادات الملف الشخصي', 404);
      return;
    }

    // Update order address
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        dropoff_address_id,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Create notification message
    if (order.driver_id) {
      await prisma.message.create({
        data: {
          order_id: orderId,
          from_user: userId,
          to_user: order.driver_id,
          content: 'تم تحديث عنوان التوصيل - يرجى التحقق من العنوان الجديد والتأكد من صحته',
          message_type: 'system',
          is_read: false,
        },
      });
    }

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم تحديث عنوان التوصيل بنجاح! تم إشعار السائق بالتغيير');
  } catch (error) {
    console.error('Update order address error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث عنوان التوصيل. يرجى المحاولة مرة أخرى', 500);
  }
};

export const reactivateOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        driver: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Only allow reactivation for delivered or cancelled orders
    if (order.status !== OrderStatus.delivered && order.status !== OrderStatus.cancelled) {
      sendError(res, 'لا يمكن إعادة تفعيل الطلب في حالته الحالية. يمكن إعادة تفعيل الطلبات المكتملة أو الملغاة فقط', 400);
      return;
    }

    // Check permissions: client can reactivate their own orders, admin can reactivate any
    if (userRole === UserRole.client && order.client_id !== userId) {
      sendError(res, 'ليس لديك صلاحية لإعادة تفعيل هذا الطلب. يمكنك فقط إعادة تفعيل طلباتك الخاصة', 403);
      return;
    }

    // Reactivate order (set to pending, clear driver if cancelled)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.pending,
        ...(order.status === OrderStatus.cancelled && { driver_id: null }),
        cancelled_at: null,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Create notification message
    if (order.driver_id) {
      await prisma.message.create({
        data: {
          order_id: orderId,
          from_user: userId,
          to_user: order.driver_id,
          content: 'تم إعادة تفعيل الطلب - سيتم تعيين سائق جديد للطلب قريباً',
          message_type: 'system',
          is_read: false,
        },
      });
    }

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_status_updated', serializedOrder);
    io.emit('order_created', serializedOrder); // Notify drivers of new pending order

    sendSuccess(res, serializedOrder, 'تم إعادة تفعيل الطلب بنجاح! سيتم تعيين سائق جديد للطلب');
  } catch (error) {
    console.error('Reactivate order error:', error);
    sendError(res, 'حدث خطأ أثناء إعادة تفعيل الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateOrderContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { content } = req.body;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Update order content
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        content,
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Create notification message
    if (order.client_id) {
      await prisma.message.create({
        data: {
          order_id: orderId,
          from_user: req.user!.id,
          to_user: order.client_id,
          content: 'تم تحديث محتوى الطلب - يرجى مراجعة التحديثات في تفاصيل الطلب',
          message_type: 'system',
          is_read: false,
        },
      });
    }

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم تحديث محتوى الطلب بنجاح! تم إشعار العميل بالتحديث');
  } catch (error) {
    console.error('Update order content error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث محتوى الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const updateOrderPrice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const { price } = req.body;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Update order price
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        price_cents: Math.round(price), // Convert to cents
        updated_at: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    // Create notification message
    if (order.client_id) {
      await prisma.message.create({
        data: {
          order_id: orderId,
          from_user: req.user!.id,
          to_user: order.client_id,
          content: `تم تحديث سعر الطلب إلى ${price} ل.ت - يرجى مراجعة السعر الجديد في تفاصيل الطلب`,
          message_type: 'system',
          is_read: false,
        },
      });
    }

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'تم تحديث سعر الطلب بنجاح! تم إشعار العميل بالتحديث');
  } catch (error) {
    console.error('Update order price error:', error);
    sendError(res, 'حدث خطأ أثناء تحديث سعر الطلب. يرجى المحاولة مرة أخرى', 500);
  }
};

export const getOrderQRCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        driver: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Check permissions
    if (userRole === UserRole.client && order.client_id !== userId) {
      sendError(res, 'ليس لديك صلاحية للوصول إلى هذا الطلب. يمكنك فقط عرض طلباتك الخاصة', 403);
      return;
    }
    if (userRole === UserRole.driver && order.driver_id !== userId) {
      sendError(res, 'ليس لديك صلاحية للوصول إلى هذا الطلب. يمكنك فقط عرض الطلبات المخصصة لك', 403);
      return;
    }

    // Generate QR code data (order code or order ID)
    const qrData = order.code_order || order.id;

    // Generate QR code as data URL
    // const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    //   errorCorrectionLevel: 'M',
    //   type: 'image/png',
    //   width: 300,
    //   margin: 1,
    // });

    // sendSuccess(res, { qr_code: qrCodeDataUrl, order_code: qrData }, 'QR code generated successfully');
  } catch (error) {
    console.error('Get order QR code error:', error);
    sendError(res, 'حدث خطأ أثناء إنشاء رمز QR. يرجى المحاولة مرة أخرى', 500);
  }
};

export const scanOrderQRCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!code) {
      sendError(res, 'يجب توفير رمز QR. يرجى مسح الرمز مرة أخرى', 400);
      return;
    }

    // Find order by code_order or id
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { code_order: code },
          { id: code },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          }
        },
        address: true,
      }
    });

    if (!order) {
      sendError(res, 'لم يتم العثور على الطلب. يرجى التحقق من رقم الطلب', 404);
      return;
    }

    // Check permissions based on role
    if (userRole === UserRole.driver) {
      // Driver can scan any order, but should only see details if assigned or pending
      if (order.status === OrderStatus.pending || order.driver_id === userId) {
        sendSuccess(res, serializeOrder(order), 'Order retrieved successfully');
      } else {
        sendError(res, 'You do not have access to this order', 403);
      }
    } else if (userRole === UserRole.client) {
      // Client can only scan their own orders
      if (order.client_id === userId) {
        sendSuccess(res, serializeOrder(order), 'Order retrieved successfully');
      } else {
        sendError(res, 'Access denied', 403);
      }
    } else if (userRole === UserRole.admin) {
      // Admin can scan any order
      sendSuccess(res, serializeOrder(order), 'Order retrieved successfully');
    } else {
      sendError(res, 'Access denied', 403);
    }
  } catch (error) {
    console.error('Scan order QR code error:', error);
    sendError(res, 'حدث خطأ أثناء مسح رمز QR. يرجى المحاولة مرة أخرى', 500);
  }
};