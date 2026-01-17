import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import Header from '@/components/ui/header';
import Tabs, { TabItem } from '@/components/ui/tabs';


const ORDER_STATUS_TABS: TabItem[] = [
  { id: 'all', label: 'الكل', icon: 'list' },
  { id: 'pending', label: 'معلقة', icon: 'time' },
  { id: 'assigned', label: 'معينة', icon: 'person-add' },
  { id: 'accepted', label: 'مقبولة', icon: 'checkmark-circle' },
  { id: 'in_transit', label: 'قيد التوصيل', icon: 'car' },
  { id: 'delivered', label: 'مكتملة', icon: 'checkmark-done-circle' },
  { id: 'cancelled', label: 'ملغاة', icon: 'close-circle' },
];

export default function ClientOrdersScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['client-orders', activeFilter],
    queryFn: async () => {
      const params: any = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get<Order[]>(`/orders/client/history${queryString ? `?${queryString}` : ''}`);
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
          {/* Filter Tabs */}
          <View className="mb-4">
            <Tabs
              tabs={ORDER_STATUS_TABS}
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
              scrollable={true}
            />
          </View>

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


