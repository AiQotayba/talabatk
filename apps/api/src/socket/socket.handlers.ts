import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.middleware';
import { authenticateSocket } from './socket.middleware';
import prisma from '../config/database';

export const setupSocketHandlers = (io: Server): void => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining order rooms
    socket.on('join_order_room', (orderId: string) => {
      // Verify user has access to this order
      verifyOrderAccess(socket.userId!, orderId)
        .then(hasAccess => {
          if (hasAccess) {
            socket.join(`order_${orderId}`);
            console.log(`User ${socket.userId} joined order room: ${orderId}`);
            
            // Notify others in the room
            socket.to(`order_${orderId}`).emit('user_joined_order', {
              userId: socket.userId,
              orderId,
              timestamp: new Date(),
            });
          } else {
            socket.emit('error', { message: 'Access denied to this order' });
          }
        })
        .catch(error => {
          console.error('Error verifying order access:', error);
          socket.emit('error', { message: 'Error verifying access' });
        });
    });

    // Handle leaving order rooms
    socket.on('leave_order_room', (orderId: string) => {
      socket.leave(`order_${orderId}`);
      console.log(`User ${socket.userId} left order room: ${orderId}`);
      
      // Notify others in the room
      socket.to(`order_${orderId}`).emit('user_left_order', {
        userId: socket.userId,
        orderId,
        timestamp: new Date(),
      });
    });

    // Handle real-time messaging
    socket.on('send_message', async (data: {
      orderId: string;
      content: string;
      messageType?: string;
      attachments?: string[];
    }) => {
      try {
        // Verify access to order
        const hasAccess = await verifyOrderAccess(socket.userId!, data.orderId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this order' });
          return;
        }

        // Get order details to determine recipient
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          select: {
            client_id: true,
            driver_id: true,
          }
        });

        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        const toUserId = order.client_id === socket.userId ? order.driver_id : order.client_id;

        // Create message in database
        const message = await prisma.message.create({
          data: {
            order_id: data.orderId,
            from_user: socket.userId!,
            to_user: toUserId,
            content: data.content,
            message_type: data.messageType || 'text',
            attachments: data.attachments || [],
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
            }
          }
        });

        // Emit to order room
        io.to(`order_${data.orderId}`).emit('message_received', message);

        // Emit to specific user
        if (toUserId) {
          io.to(`user_${toUserId}`).emit('message_received', message);
        }

        console.log(`Message sent in order ${data.orderId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle driver location updates
    socket.on('update_location', async (data: {
      lat: number;
      lng: number;
      status: string;
    }) => {
      try {
        if (socket.userRole !== 'driver') {
          socket.emit('error', { message: 'Only drivers can update location' });
          return;
        }

        // Update driver location in database
        await prisma.user.update({
          where: { id: socket.userId! },
          data: {
            metadata: {
              current_location: { lat: data.lat, lng: data.lng },
              last_location_update: new Date().toISOString(),
              status: data.status,
            },
            updated_at: new Date(),
          }
        });

        // Create status log
        await prisma.driverStatusLog.create({
          data: {
            driver_id: socket.userId!,
            status: data.status as any,
            started_at: new Date(),
          }
        });

        // Emit location update to relevant clients
        const locationUpdate = {
          driver_id: socket.userId,
          location: { lat: data.lat, lng: data.lng },
          status: data.status,
          timestamp: new Date(),
        };

        // Emit to all clients (for nearby driver tracking)
        io.emit('driver_location_updated', locationUpdate);

        console.log(`Driver ${socket.userId} location updated:`, data);
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { orderId: string }) => {
      socket.to(`order_${data.orderId}`).emit('user_typing', {
        userId: socket.userId,
        orderId: data.orderId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { orderId: string }) => {
      socket.to(`order_${data.orderId}`).emit('user_typing', {
        userId: socket.userId,
        orderId: data.orderId,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId} (${reason})`);
      
      // Notify all order rooms that user left
      socket.rooms.forEach(room => {
        if (room.startsWith('order_')) {
          socket.to(room).emit('user_left_order', {
            userId: socket.userId,
            orderId: room.replace('order_', ''),
            timestamp: new Date(),
          });
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};

// Helper function to verify order access
const verifyOrderAccess = async (userId: string, orderId: string): Promise<boolean> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        client_id: true,
        driver_id: true,
      }
    });

    if (!order) {
      return false;
    }

    // Check if user is client or driver of this order
    return order.client_id === userId || order.driver_id === userId;
  } catch (error) {
    console.error('Error verifying order access:', error);
    return false;
  }
};
