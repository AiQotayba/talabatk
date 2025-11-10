import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import prisma from '../config/database';
import { Server } from 'socket.io';

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fromUserId = req.user!.id;
    const { order_id, to_user, content, message_type = 'text', attachments = [] }: {
      order_id?: string;
      to_user?: string;
      content?: string;
      message_type?: string;
      attachments?: string[];
    } = req.body;

    // Validate that either order_id or to_user is provided
    if (!order_id && !to_user) {
      sendError(res, 'Either order_id or to_user is required', 400);
      return;
    }

    // If order_id is provided, verify the user has access to this order
    if (order_id) {
      const order = await prisma.order.findUnique({
        where: { id: order_id },
        include: {
          client: true,
          driver: true,
        }
      });

      if (!order) {
        sendError(res, 'Order not found', 404);
        return;
      }

      // Check if user is part of this order
      if (order.client_id !== fromUserId && order.driver_id !== fromUserId) {
        sendError(res, 'Access denied to this order', 403);
        return;
      }

      // Set to_user based on order participants
      if (order.client_id === fromUserId) {
        req.body.to_user = order.driver_id;
      } else {
        req.body.to_user = order.client_id;
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        order_id: order_id || null,
        from_user: fromUserId,
        to_user: req.body.to_user,
        content: content || null,
        attachments,
        message_type,
        is_read: false,
      },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        },
        to: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        },
        order: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    // Emit socket event
    const io: Server = req.app.get('io');
    
    // Emit to order room if order_id exists
    if (order_id) {
      io.to(`order_${order_id}`).emit('message_received', message);
    }
    
    // Emit to specific user if to_user exists
    if (req.body.to_user) {
      io.to(`user_${req.body.to_user}`).emit('message_received', message);
    }

    sendSuccess(res, message, 'Message sent successfully', 201);
  } catch (error) {
    console.error('Send message error:', error);
    sendError(res, 'Failed to send message', 500);
  }
};

export const getOrderMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;

    // Verify user has access to this order
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

    // Check if user is part of this order
    if (order.client_id !== userId && order.driver_id !== userId) {
      sendError(res, 'Access denied to this order', 403);
      return;
    }

    // Get messages for this order
    const messages = await prisma.message.findMany({
      where: { order_id: orderId },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        },
        to: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        }
      },
      orderBy: { created_at: 'asc' },
    });

    sendSuccess(res, messages, 'Messages retrieved successfully');
  } catch (error) {
    console.error('Get order messages error:', error);
    sendError(res, 'Failed to retrieve messages', 500);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const messageId = req.params.id;
    const userId = req.user!.id;

    // Find message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      sendError(res, 'Message not found', 404);
      return;
    }

    // Check if user is the recipient
    if (message.to_user !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }

    // Mark as read
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { is_read: true },
      include: {
        from: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        },
        to: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        }
      }
    });

    sendSuccess(res, updatedMessage, 'Message marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    sendError(res, 'Failed to mark message as read', 500);
  }
};
