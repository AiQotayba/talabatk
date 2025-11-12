import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { OrderChat } from '@/components/orderChat';

export default function OrderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'rate':
        router.push(`/(client)/orders/${id}/rating`);
        break;
      case 'complaint':
        router.push(`/(client)/orders/${id}/complaint`);
        break;
      default:
        break;
    }
  };

  return (
    <OrderChat
      orderId={id!}
      role="client"
      onBack={() => router.back()}
      onAction={handleAction}
    />
  );
}
