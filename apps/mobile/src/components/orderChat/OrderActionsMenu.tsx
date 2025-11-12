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
}: OrderActionsMenuProps) {
  const actions: OrderAction[] = [];

  // Client actions
  if (role === 'client') {
    if (canCancelOrder(order, role) && onCancel) {
      actions.push({
        id: 'cancel',
        label: 'إلغاء الطلب',
        icon: 'close-circle',
        color: '#dc2626',
        bgColor: 'bg-red-50',
        visible: true,
        onPress: onCancel,
      });
    }
    if (canRateOrder(order, role) && onRate) {
      actions.push({
        id: 'rate',
        label: 'تقييم الطلب',
        icon: 'star',
        color: '#E02020',
        bgColor: 'bg-primary-50',
        visible: true,
        onPress: onRate,
      });
    }
    if (onComplaint) {
      actions.push({
        id: 'complaint',
        label: 'تقديم شكوى',
        icon: 'alert-circle',
        color: '#d97706',
        bgColor: 'bg-warning-50',
        visible: true,
        onPress: onComplaint,
      });
    }
  }

  // Driver actions
  if (role === 'driver') {
    if ((order.status === 'assigned' || order.status === 'pending') && onAccept) {
      actions.push({
        id: 'accept',
        label: 'قبول الطلب',
        icon: 'checkmark-circle',
        color: '#16a34a',
        bgColor: 'bg-green-50',
        visible: true,
        onPress: onAccept,
      });
    }
    if ((order.status === 'assigned' || order.status === 'pending') && onReject) {
      actions.push({
        id: 'reject',
        label: 'رفض الطلب',
        icon: 'close-circle',
        color: '#dc2626',
        bgColor: 'bg-red-50',
        visible: true,
        onPress: onReject,
      });
    }
    if (order.status === 'accepted' && onUpdateStatus) {
      actions.push({
        id: 'picked_up',
        label: 'تم الاستلام',
        icon: 'checkmark-done-circle',
        color: '#2563eb',
        bgColor: 'bg-blue-50',
        visible: true,
        onPress: () => onUpdateStatus('picked_up'),
      });
    }
    if (order.status === 'picked_up' && onUpdateStatus) {
      actions.push({
        id: 'in_transit',
        label: 'في الطريق',
        icon: 'car',
        color: '#7c3aed',
        bgColor: 'bg-purple-50',
        visible: true,
        onPress: () => onUpdateStatus('in_transit'),
      });
    }
    if (order.status === 'in_transit' && onUpdateStatus) {
      actions.push({
        id: 'delivered',
        label: 'تم التسليم',
        icon: 'checkmark-circle',
        color: '#16a34a',
        bgColor: 'bg-green-50',
        visible: true,
        onPress: () => onUpdateStatus('delivered'),
      });
    }
  }

  // Admin actions
  if (role === 'admin' && onCancel) {
    actions.push({
      id: 'cancel',
      label: 'إلغاء الطلب',
      icon: 'close-circle',
      color: '#dc2626',
      bgColor: 'bg-red-50',
      visible: true,
      onPress: onCancel,
    });
  }

  if (actions.length === 0) return null;

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
              {actions.map((action) => (
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

