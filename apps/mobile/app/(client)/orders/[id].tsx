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
      case 'update_address':
        router.push(`/(client)/orders/${id}/update-address`);
        break;
      case 'show_qr_code':
        router.push(`/(client)/orders/${id}/qr-code`);
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
