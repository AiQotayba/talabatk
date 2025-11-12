import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderChat } from '@/components/orderChat';

export default function AdminOrderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleAction = (action: string, data?: any) => {
    // Admin can perform various actions on orders
    switch (action) {
      case 'assign':
        // TODO: Implement assign driver
        break;
      case 'cancel':
        // TODO: Implement cancel order
        break;
      default:
        break;
    }
  };

  return (
    <OrderChat
      orderId={id!}
      role="admin"
      onBack={() => router.back()}
      onAction={handleAction}
    />
  );
}


