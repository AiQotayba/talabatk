import { Order } from '@/types/order.types';

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    assigned: 'تم التعيين',
    accepted: 'مقبول',
    picked_up: 'تم الاستلام',
    in_transit: 'قيد التوصيل',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    failed: 'فشل',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'delivered':
      return 'bg-success-100 text-success-700';
    case 'cancelled':
    case 'failed':
      return 'bg-error-100 text-error-700';
    case 'pending':
    case 'assigned':
      return 'bg-warning-100 text-warning-700';
    default:
      return 'bg-primary-100 text-primary-700';
  }
};

export const formatOrderId = (id: string): string => {
  return `طلب #${id}`;
};

export const canCancelOrder = (order: Order, role: string): boolean => {
  if (role === 'admin') return true;
  if (role === 'client') return order.status === 'pending' || order.status === 'assigned';
  return false;
};

export const canRateOrder = (order: Order, role: string): boolean => {
  return role === 'client' && order.status === 'delivered';
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'delivered':
      return 'checkmark-circle';
    case 'cancelled':
    case 'failed':
      return 'close-circle';
    case 'pending':
    case 'assigned':
      return 'time';
    default:
      return 'information-circle';
  }
};