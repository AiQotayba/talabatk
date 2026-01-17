import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/utils/constants';

class SocketClient {
  private socket: Socket | null = null;
  private isConnecting = false;

  /**
   * Initialize socket connection with authentication
   */
  async connect(): Promise<Socket | null> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      return null;
    }

    try {
      this.isConnecting = true;

      // Get access token
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        console.warn('[Socket] No access token found, cannot connect');
        return null;
      }

      // Create socket connection
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('[Socket] Connected:', this.socket?.id);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        this.isConnecting = false;
      });

      this.socket.on('error', (error) => {
        console.error('[Socket] Error:', error);
      });

      return this.socket;
    } catch (error) {
      console.error('[Socket] Failed to connect:', error);
      this.isConnecting = false;
      return null;
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  /**
   * Reconnect socket (useful after token refresh)
   */
  async reconnect(): Promise<Socket | null> {
    this.disconnect();
    return this.connect();
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join an order room
   */
  joinOrderRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_order_room', orderId);
    }
  }

  /**
   * Leave an order room
   */
  leaveOrderRoom(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_order_room', orderId);
    }
  }

  /**
   * Send a message via socket
   */
  sendMessage(data: {
    orderId: string;
    content: string;
    messageType?: string;
    attachments?: string[];
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    }
  }

  /**
   * Update driver location
   */
  updateLocation(data: { lat: number; lng: number; status: string }): void {
    if (this.socket?.connected) {
      this.socket.emit('update_location', data);
    }
  }

  /**
   * Send typing indicator start
   */
  startTyping(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { orderId });
    }
  }

  /**
   * Send typing indicator stop
   */
  stopTyping(orderId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { orderId });
    }
  }
}

// Singleton instance
export const socketClient = new SocketClient();
