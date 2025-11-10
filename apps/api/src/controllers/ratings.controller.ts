import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import prisma from '../config/database';
import { OrderStatus } from '@prisma/client';

export const createRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clientId = req.user!.id;
    const { order_id, driver_id, score, comment }: {
      order_id: string;
      driver_id: string;
      score: number;
      comment?: string;
    } = req.body;

    // Validate score
    if (score < 1 || score > 5) {
      sendError(res, 'Score must be between 1 and 5', 400);
      return;
    }

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

    if (order.driver_id !== driver_id) {
      sendError(res, 'Driver does not match order', 400);
      return;
    }

    if (order.status !== OrderStatus.delivered) {
      sendError(res, 'Can only rate delivered orders', 400);
      return;
    }

    // Check if rating already exists
    const existingRating = await prisma.rating.findFirst({
      where: {
        order_id,
        client_id: clientId,
      }
    });

    if (existingRating) {
      sendError(res, 'Order has already been rated', 400);
      return;
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        order_id,
        client_id: clientId,
        driver_id,
        score,
        comment,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
          }
        },
        order: {
          select: {
            id: true,
            content: true,
            status: true,
          }
        }
      }
    });

    sendSuccess(res, rating, 'Rating created successfully', 201);
  } catch (error) {
    console.error('Create rating error:', error);
    sendError(res, 'Failed to create rating', 500);
  }
};

export const getDriverRatings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.params.id;

    // Get driver's ratings
    const ratings = await prisma.rating.findMany({
      where: { driver_id: driverId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            profile_photo_url: true,
          }
        },
        order: {
          select: {
            id: true,
            content: true,
            created_at: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate average rating
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length 
      : 0;

    const ratingStats = {
      total_ratings: ratings.length,
      average_rating: Math.round(averageRating * 100) / 100,
      rating_breakdown: {
        5: ratings.filter(r => r.score === 5).length,
        4: ratings.filter(r => r.score === 4).length,
        3: ratings.filter(r => r.score === 3).length,
        2: ratings.filter(r => r.score === 2).length,
        1: ratings.filter(r => r.score === 1).length,
      }
    };

    sendSuccess(res, {
      ratings,
      stats: ratingStats,
    }, 'Driver ratings retrieved successfully');
  } catch (error) {
    console.error('Get driver ratings error:', error);
    sendError(res, 'Failed to retrieve driver ratings', 500);
  }
};
