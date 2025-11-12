import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import Header from '@/components/ui/header';

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    assigned: 'تم التعيين',
    in_progress: 'قيد التنفيذ',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    failed: 'فشل',
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
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

export default function ClientOrdersScreen() {
  const router = useRouter();

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['client-orders'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/orders/client/history');
      return response.data || [];
    },
  });

  return (
    <View className="flex-1 bg-gray-50 py-6">
      <Header title="طلباتي" description="جميع طلباتك السابقة" />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        style={{ direction: 'rtl' }}
      >
        <View className="px-6 py-4" style={{ direction: 'rtl' }}>
          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#E02020" />
              <Text className="text-gray-500 mt-4">جاري تحميل الطلبات...</Text>
            </View>
          ) : ordersData && ordersData.length > 0 ? (
            ordersData.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))
          ) : (
            <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center">
              <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 mb-6">ما عندك طلبات حالياً</Text>
              <TouchableOpacity
                className="bg-primary-600 rounded-xl py-3 px-6"
                onPress={() => router.push('/(client)/(tabs)')}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">إنشاء أول طلب</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


