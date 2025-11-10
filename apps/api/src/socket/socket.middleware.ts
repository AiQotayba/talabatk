import { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util';
import prisma from '../config/database';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        role: true,
        name: true,
      }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user.id;
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
