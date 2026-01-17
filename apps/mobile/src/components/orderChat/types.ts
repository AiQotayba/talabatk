import { Order, Message } from '@/types/order.types';
import { UserRole } from '@/types/auth.types';

export type OrderChatRole = 'client' | 'driver' | 'admin';

export interface OrderChatProps {
  orderId: string;
  role: OrderChatRole;
  onBack?: () => void;
  onAction?: (action: string, data?: any) => void;
}

export interface OrderAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  visible: boolean;
  onPress?: any
  role: OrderChatRole[];
  condition?: any;
}

export interface OrderChatContextType {
  order: Order | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  currentUserId?: string;
  role: OrderChatRole;
  sendMessage: (content: string) => void;
  updateOrderStatus: (status: string) => void;
  performAction: (action: string, data?: any) => void;
}

