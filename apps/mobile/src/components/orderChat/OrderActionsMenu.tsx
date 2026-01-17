import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderAction, OrderChatRole } from './types';
import { canCancelOrder, canRateOrder } from './utils';

interface OrderActionsMenuProps {
  visible: boolean;
  order: Order;
  role: OrderChatRole;
  onClose: () => void;
  onCancel?: () => void;
  onRate?: () => void;
  onComplaint?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onUpdateStatus?: (status: string) => void;
  onUpdateAddress?: () => void;
  onReorder?: () => void;
  onUpdateContent?: () => void;
  onUpdatePrice?: () => void;
  onCreateFeatured?: () => void;
  onShowQRCode?: () => void;
  onScanQRCode?: () => void;
}

export default function OrderActionsMenu({
  visible,
  order,
  role,
  onClose,
  onCancel,
  onRate,
  onComplaint,
  onAccept,
  onReject,
  onUpdateStatus,
  onUpdateAddress,
  onReorder,
  onUpdateContent,
  onUpdatePrice,
  onCreateFeatured,
  onShowQRCode,
  onScanQRCode,
}: OrderActionsMenuProps) {

  const OrderActions: OrderAction[] = [
    {
      id: 'show_qr',
      label: 'عرض رمز QR',
      icon: 'qr-code',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      visible: true,
      onPress: onShowQRCode,
      role: ['client', 'driver', 'admin'],
      condition: (order: Order) => !!order.code_order && !!onShowQRCode,
    },
    {
      id: 'scan_qr',
      label: 'مسح رمز QR',
      icon: 'scan',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      visible: true,
      onPress: onScanQRCode,
      role: ['driver', 'admin'],
      condition: (order: Order) => !!onScanQRCode,
    },
    {
      id: 'reorder',
      label: 'إعادة الطلب',
      icon: 'refresh',
      color: '#16a34a',
      bgColor: 'bg-green-50',
      visible: true,
      onPress: onReorder,
      role: ['client'],
      condition: (order: Order) => order.status === 'delivered' || order.status === 'cancelled',
    },     {
      id: 'update_address',
      label: 'تحديث العنوان',
      icon: 'location',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      visible: true,
      onPress: onUpdateAddress,
      role: ['client'],
      condition: (order: Order) => (order.status === 'pending' || order.status === 'assigned') && !!onUpdateAddress,
    },
    {
      id: 'accept',
      label: 'قبول الطلب',
      icon: 'checkmark-circle',
      color: '#16a34a',
      bgColor: 'bg-green-50',
      visible: true,
      onPress: onAccept,
      role: ['driver'],
      condition: (order: Order) => (order.status === 'assigned' || order.status === 'pending') && !!onAccept,
    },
    {
      id: 'cancel',
      label: 'إلغاء الطلب',
      icon: 'close-circle',
      color: '#dc2626',
      bgColor: 'bg-red-50',
      visible: true,
      onPress: onCancel,
      role: ['client'],
      condition: (order: Order) => canCancelOrder(order, role) && !!onCancel,
    },
    {
      id: 'reject',
      label: 'رفض الطلب',
      icon: 'close-circle',
      color: '#dc2626',
      bgColor: 'bg-red-50',
      visible: true,
      onPress: onReject,
      role: ['driver'],
      condition: (order: Order) => (order.status === 'assigned' || order.status === 'pending') && !!onReject,
    },
    {
      id: 'rate',
      label: 'تقييم الطلب',
      icon: 'star',
      color: '#E02020',
      bgColor: 'bg-primary-50',
      visible: true,
      onPress: onRate,
      role: ['client'],
      condition: (order: Order) => canRateOrder(order, role) && !!onRate,
    },

    {
      id: 'complaint',
      label: 'تقديم شكوى',
      icon: 'alert-circle',
      color: '#d97706',
      bgColor: 'bg-warning-50',
      visible: true,
      onPress: onComplaint,
      role: ['client'],
      condition: (order: Order) => !!onComplaint,
    },
    {
      id: 'picked_up',
      label: 'تم الاستلام',
      icon: 'checkmark-done-circle',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      visible: true,
      onPress: () => onUpdateStatus?.('picked_up'),
      role: ['driver'],
      condition: (order: Order) => order.status === 'accepted' && !!onUpdateStatus,
    },
    {
      id: 'in_transit',
      label: 'في الطريق',
      icon: 'car',
      color: '#7c3aed',
      bgColor: 'bg-purple-50',
      visible: true,
      onPress: () => onUpdateStatus?.('in_transit'),
      role: ['driver'],
      condition: (order: Order) => order.status === 'picked_up' && !!onUpdateStatus,
    },
    {
      id: 'delivered',
      label: 'تم التسليم',
      icon: 'checkmark-circle',
      color: '#16a34a',
      bgColor: 'bg-green-50',
      visible: true,
      onPress: () => onUpdateStatus?.('delivered'),
      role: ['driver'],
      condition: (order: Order) => order.status === 'in_transit' && !!onUpdateStatus,
    }, 
    {
      id: 'update_content',
      label: 'تحديث المحتوى',
      icon: 'document-text',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      visible: true,
      onPress: onUpdateContent,
      role: ['admin'],
      condition: (order: Order) => !!onUpdateContent,
    },
    {
      id: 'update_price',
      label: 'تحديث السعر',
      icon: 'cash',
      color: '#16a34a',
      bgColor: 'bg-green-50',
      visible: true,
      onPress: onUpdatePrice,
      role: ['admin'],
      condition: (order: Order) => !!onUpdatePrice,
    },
    {
      id: 'create_featured',
      label: 'إنشاء طلب مميز',
      icon: 'star',
      color: '#d97706',
      bgColor: 'bg-orange-50',
      visible: true,
      onPress: onCreateFeatured,
      role: ['admin'],
      condition: (order: Order) => !!onCreateFeatured,
    },
    {
      id: 'reorder',
      label: 'إعادة تفعيل الطلب',
      icon: 'refresh',
      color: '#16a34a',
      bgColor: 'bg-green-50',
      visible: true,
      onPress: onReorder,
      role: ['admin'],
      condition: (order: Order) => (order.status === 'delivered' || order.status === 'cancelled') && !!onReorder,
    },
    {
      id: 'cancel',
      label: 'إلغاء الطلب',
      icon: 'close-circle',
      color: '#dc2626',
      bgColor: 'bg-red-50',
      visible: true,
      onPress: onCancel,
      role: ['admin'],
      condition: (order: Order) => canCancelOrder(order, role) && !!onCancel,
    },
  ]

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-end" style={{ direction: 'rtl' }}>
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">خيارات الطلب</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="gap-2">
              {OrderActions
                .filter((action) => action.condition && action.condition(order))
                .filter((action) => action.role.includes(role))
                .map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    className={`flex-row items-center gap-3 p-4 rounded-xl ${action.bgColor}`}
                    onPress={() => {
                      onClose();
                      action.onPress();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                    <Text className={`font-semibold text-base`} style={{ color: action.color }}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

