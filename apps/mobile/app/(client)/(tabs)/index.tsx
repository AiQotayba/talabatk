import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import Header from '@/components/ui/header';


export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['client-orders', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/orders/client/history?limit=5');
      return response.data || [];
    },
  });

  return (
    <ScrollView
      className="flex-1 my-10 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title={`أهلاً بك، ${user?.name}`} description="شو بدك تطلب اليوم؟" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-5 px-6 mb-6"
            onPress={() => router.push('/(client)/orders/create')}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-center gap-3" >
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text className="text-white text-center font-bold text-lg">
                إنشاء طلب جديد
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4 text-start">الطلبات الأخيرة</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#E02020" />
              <Text className="text-gray-500 mt-4">جاري التحميل...</Text>
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
                onPress={() => router.push('/(client)/orders/create')}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">إنشاء أول طلب</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

      </View>
    </ScrollView >
  );
}


