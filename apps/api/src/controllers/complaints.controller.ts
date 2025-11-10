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
      sendError(res, 'Order not found', 404);
      return;
    }

    if (order.client_id !== clientId) {
      sendError(res, 'Access denied', 403);
      return;
    }

    // Check if complaint already exists for this order
    const existingComplaint = await prisma.complaint.findFirst({
      where: { order_id }
    });

    if (existingComplaint) {
      sendError(res, 'Complaint already exists for this order', 400);
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

    sendSuccess(res, complaint, 'Complaint created successfully', 201);
  } catch (error) {
    console.error('Create complaint error:', error);
    sendError(res, 'Failed to create complaint', 500);
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
      sendError(res, 'Complaint not found', 404);
      return;
    }

    // Check permissions
    if (userRole === 'client' && complaint.client_id !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }

    sendSuccess(res, complaint, 'Complaint retrieved successfully');
  } catch (error) {
    console.error('Get complaint error:', error);
    sendError(res, 'Failed to retrieve complaint', 500);
  }
};
