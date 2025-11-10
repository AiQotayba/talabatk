import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { NearbyDriversQuery, OrderTrackingResponse } from '../types/order.types';
import prisma from '../config/database';
import { DriverStatus } from '@prisma/client';
import { calculateDistance, isValidCoordinates } from '../utils/validation.util';
import { Server } from 'socket.io';
import { Prisma } from '@prisma/client';

export const updateDriverLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const driverId = req.user!.id;
    const { lat, lng, status }: { lat: number; lng: number; status: DriverStatus } = req.body;

    // Validate coordinates
    if (!isValidCoordinates(lat, lng)) {
      sendError(res, 'Invalid coordinates', 400);
      return;
    }

    // Update driver location in metadata
    const updatedUser = await prisma.user.update({
      where: { id: driverId },
      data: {
        metadata: {
          current_location: { lat, lng },
          last_location_update: new Date().toISOString(),
        },
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        metadata: true,
      }
    });

    // Create status log entry
    await prisma.driverStatusLog.create({
      data: {
        driver_id: driverId,
        status,
        started_at: new Date(),
      }
    });

    // Emit socket event for real-time tracking
    const io: Server = req.app.get('io');
    io.emit('driver_location_updated', {
      driver_id: driverId,
      location: { lat, lng },
      status,
      timestamp: new Date(),
    });

    sendSuccess(res, {
      location: { lat, lng },
      status,
      updated_at: updatedUser.metadata,
    }, 'Driver location updated successfully');
  } catch (error) {
    console.error('Update driver location error:', error);
    sendError(res, 'Failed to update driver location', 500);
  }
};

export const trackOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
            metadata: true,
          }
        },
        address: true,
      }
    });

    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }

    // Check permissions
    if (userRole === 'client' && order.client_id !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }
    if (userRole === 'driver' && order.driver_id !== userId) {
      sendError(res, 'Access denied', 403);
      return;
    }

    const trackingResponse: OrderTrackingResponse = {
      order: {
        id: order.id,
        status: order.status,
        content: order.content || '',
        created_at: order.created_at,
        actual_pickup_at: order.actual_pickup_at,
        delivered_at: order.delivered_at,
      },
      client: {
        id: order.client?.id || '',
        name: order.client?.name || '',
        phone: order.client?.phone || '',
      },
      address: {
        city: order.address?.city || null,
        street: order.address?.street || null,
        lat: order.address?.lat || null,
        lng: order.address?.lng || null,
      },
    };

    // Add driver info if available
    if (order.driver) {
      trackingResponse.driver = {
        id: order.driver.id,
        name: order.driver.name,
        phone: order.driver.phone,
        current_location: (order.driver.metadata as { current_location?: { lat: number; lng: number } })?.current_location || undefined,
      };
    }

    sendSuccess(res, trackingResponse, 'Order tracking data retrieved successfully');
  } catch (error) {
    console.error('Track order error:', error);
    sendError(res, 'Failed to retrieve order tracking data', 500);
  }
};

export const getNearbyDrivers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 10 }: NearbyDriversQuery = req.query as any;

    // Validate coordinates
    if (!isValidCoordinates(Number(lat), Number(lng))) {
      sendError(res, 'Invalid coordinates', 400);
      return;
    }

    // Get all available drivers
    const drivers = await prisma.user.findMany({
      where: {
        role: 'driver',
        metadata: {
          path: ['current_location'],
          not: Prisma.JsonNull,
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        profile_photo_url: true,
        metadata: true,
        created_at: true,
      }
    });

    // Filter drivers by distance
    const nearbyDrivers = drivers
      .map(driver => {
        const location = (driver.metadata as { current_location?: { lat: number; lng: number } })?.current_location;
        if (!location || typeof location !== 'object' || !('lat' in location) || !('lng' in location)) return null;

        const distance = calculateDistance(
          Number(lat),
          Number(lng),
          location.lat,
          location.lng
        );

        return {
          ...driver,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      })
      .filter(driver => driver && driver.distance <= Number(radius))
      .sort((a, b) => a!.distance - b!.distance);

    sendSuccess(res, nearbyDrivers, 'Nearby drivers retrieved successfully');
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    sendError(res, 'Failed to retrieve nearby drivers', 500);
  }
};
