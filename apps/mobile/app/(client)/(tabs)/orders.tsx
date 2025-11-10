import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200" style={{ direction: 'rtl' }}>
        <Text className="text-2xl font-bold text-gray-900 text-right">طلباتي</Text>
      </View>

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
              <Animated.View
                key={order.id}
                entering={FadeInDown.duration(400).delay(index * 50)}
              >
                <TouchableOpacity
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                  onPress={() => router.push(`/(client)/orders/${order.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-2" style={{ flexDirection: 'row-reverse' }}>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
                        <Ionicons name="receipt-outline" size={20} color="#E02020" />
                        <Text className="font-bold text-gray-900 text-base">
                          طلب #{order.id.slice(0, 8)}
                        </Text>
                      </View>
                      <Text className="text-gray-700 text-sm mb-2 text-right" numberOfLines={2}>
                        {order.content}
                      </Text>
                      <View className="flex-row items-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                        <Ionicons name="time-outline" size={14} color="#9ca3af" />
                        <Text className="text-gray-500 text-xs">
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${getStatusColor(order.status)}`}>
                      <Text className="text-xs font-semibold">{getStatusText(order.status)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
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


