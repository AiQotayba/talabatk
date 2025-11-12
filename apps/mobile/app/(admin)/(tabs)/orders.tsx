import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import Header from '@/components/ui/header';

export default function AdminOrdersScreen() {
  const router = useRouter();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/admin/orders');
      return response.data || [];
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="إدارة الطلبات" description="جميع الطلبات في النظام" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
          </View>
        ) : orders && orders.length > 0 ? (
          orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} role="admin" />
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-right mt-4">لا توجد طلبات حالياً</Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}


