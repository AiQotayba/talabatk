import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from '@/services/socket/socketClient';
import { useAppSelector } from '@/store/hooks';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user, accessToken } = useAppSelector((state) => state.auth);
  const connect = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const socketInstance = await socketClient.connect();
      if (socketInstance) {
        setSocket(socketInstance);
        setIsConnected(socketInstance.connected);

        // Listen to connection status changes
        socketInstance.on('connect', () => {
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });
      }
    } catch (error) {
      console.error('[SocketContext] Failed to connect:', error);
    }
  };

  const disconnect = () => {
    socketClient.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  const reconnect = async () => {
    disconnect();
    await connect();
  };

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) connect();
    else disconnect();


    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Reconnect when access token changes (e.g., after refresh)
  useEffect(() => {
    if (isAuthenticated && user && accessToken && socket) {
      // If socket exists but token changed, reconnect
      reconnect();
    }
  }, [accessToken]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
