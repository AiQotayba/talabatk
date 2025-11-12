import { Response } from 'express';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderHistoryQuery } from '../types/order.types';
import prisma from '../config/database';
import { OrderStatus, UserRole } from '@prisma/client';
import { Server } from 'socket.io';

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
      sendError(res, 'Address not found', 404);
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

    sendSuccess(res, serializeOrder(order), 'Order created successfully', 201);
  } catch (error) {
    console.error('Create order error:', error);
    sendError(res, 'Failed to create order', 500);
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
    
    sendSuccess(res, serializeOrders(orders), 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get orders error:', error);
    sendError(res, 'Failed to retrieve orders', 500);
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
      sendError(res, 'Order not found', 404);
      return;
    }

    // Check permissions
    if (userRole === UserRole.client && order.client_id !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }
    if (userRole === UserRole.driver && order.driver_id !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }

    sendSuccess(res, serializeOrder(order), 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    sendError(res, 'Failed to retrieve order', 500);
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
      sendError(res, 'Order not found', 404);
      return;
    }

    // Validate status transitions based on user role
    const validTransitions: Record<UserRole, OrderStatus[]> = {
      [UserRole.client]: [OrderStatus.cancelled],
      [UserRole.driver]: [OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit, OrderStatus.delivered],
      [UserRole.admin]: Object.values(OrderStatus),
    };

    if (!validTransitions[userRole].includes(status)) {
      sendError(res, 'Invalid status transition for your role', 400);
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

    // Emit socket event
    const io: Server = req.app.get('io');
    const serializedOrder = serializeOrder(updatedOrder);
    io.to(`order_${orderId}`).emit('order_status_updated', serializedOrder);

    sendSuccess(res, serializedOrder, 'Order status updated successfully');
  } catch (error) {
    console.error('Update order status error:', error);
    sendError(res, 'Failed to update order status', 500);
  }
};

export const getClientOrderHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status }: OrderHistoryQuery = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      client_id: userId,
      ...(status && { status }),
    };

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
    sendError(res, 'Failed to retrieve order history', 500);
  }
};

export const getDriverPendingOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get driver's current location (if available)
    const driver = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true }
    });

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.pending,
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
      },
      orderBy: { created_at: 'asc' },
    });

    sendSuccess(res, serializeOrders(pendingOrders), 'Pending orders retrieved successfully');
  } catch (error) {
    console.error('Get driver pending orders error:', error);
    sendError(res, 'Failed to retrieve pending orders', 500);
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
      sendError(res, 'Order not found', 404);
      return;
    }

    if (order.status !== OrderStatus.pending) {
      sendError(res, 'Order is no longer available', 400);
      return;
    }

    if (order.driver_id) {
      sendError(res, 'Order has already been assigned', 400);
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

    sendSuccess(res, serializedOrder, 'Order accepted successfully');
  } catch (error) {
    console.error('Accept order error:', error);
    sendError(res, 'Failed to accept order', 500);
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
      sendError(res, 'Order not found', 404);
      return;
    }

    if (order.driver_id !== driverId) {
      sendError(res, 'Order is not assigned to you', 400);
      return;
    }

    if (order.status !== OrderStatus.assigned) {
      sendError(res, 'Order cannot be rejected in current status', 400);
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

    sendSuccess(res, serializedOrder, 'Order rejected successfully');
  } catch (error) {
    console.error('Reject order error:', error);
    sendError(res, 'Failed to reject order', 500);
  }
};

export const uploadProof = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const driverId = req.user!.id;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      sendError(res, 'No proof photos uploaded', 400);
      return;
    }

    // Check if order is assigned to this driver
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    if (order.driver_id !== driverId) {
      sendError(res, 'Order is not assigned to you', 400);
      return;
    }

    // Add proof URLs to order
    const proofUrls = req.files.map((file: any) => `/uploads/proofs/${file.filename}`);
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

    sendSuccess(res, serializedOrder, 'Proof photos uploaded successfully');
  } catch (error) {
    console.error('Upload proof error:', error);
    sendError(res, 'Failed to upload proof photos', 500);
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
    sendError(res, 'Failed to retrieve driver order history', 500);
  }
};