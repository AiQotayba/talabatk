import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OrderChat } from '@/components/orderChat';
import CreateFeaturedOrderDialog from '@/components/admin/CreateFeaturedOrderDialog';
import UpdateOrderContentDialog from '@/components/admin/UpdateOrderContentDialog';
import { Order } from '@/types/order.types';

export default function AdminOrderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [showUpdateContentDialog, setShowUpdateContentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleAction = (action: string, data?: any) => {
    // Admin can perform various actions on orders
    switch (action) {
      case 'update_content':
        // Use dialog instead of navigating to a new page
        if (data?.order) {
          setSelectedOrder(data.order);
          setShowUpdateContentDialog(true);
        }
        break;
      case 'update_price':
        router.push(`/(admin)/orders/${id}/update-price`);
        break;
      case 'create_featured':
        // Use dialog instead of navigating to a new page
        if (data?.order) {
          setSelectedOrder(data.order);
          setShowFeaturedDialog(true);
        }
        break;
      case 'show_qr_code':
        router.push(`/(admin)/orders/${id}/qr-code`);
        break;
      case 'scan_qr_code':
        router.push('/(admin)/orders/scan-qr');
        break;
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
    <>
      <OrderChat
        orderId={id!}
        role="admin"
        onBack={() => router.back()}
        onAction={handleAction}
      />
      <CreateFeaturedOrderDialog
        visible={showFeaturedDialog}
        order={selectedOrder}
        onClose={() => {
          setShowFeaturedDialog(false);
          setSelectedOrder(null);
        }}
      />
      <UpdateOrderContentDialog
        visible={showUpdateContentDialog}
        order={selectedOrder}
        onClose={() => {
          setShowUpdateContentDialog(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}


