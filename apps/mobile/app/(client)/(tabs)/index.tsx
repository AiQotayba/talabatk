import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
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
      <View className="bg-white px-6 py-8" style={{ direction: 'rtl' }}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text className="text-3xl font-bold text-gray-900 text-start mb-2">
            أهلاً بك، {user?.name}
          </Text>
          <Text className="text-gray-600 text-base text-start">
            شو بدك تطلب اليوم؟
          </Text>
        </Animated.View>
      </View>

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
            <View className="flex-row items-center justify-center gap-3" style={{ flexDirection: 'row-reverse' }}>
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
              <Animated.View
                key={order.id}
                entering={FadeInDown.duration(400).delay(index * 100)}
              >
                <TouchableOpacity
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                  onPress={() => router.push(`/(client)/orders/${order.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start" style={{ flexDirection: 'row-reverse' }}>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
                        <Ionicons name="receipt-outline" size={20} color="#E02020" />
                        <Text className="font-bold text-gray-900 text-base">
                          طلب #{order.id.slice(0, 8)}
                        </Text>
                      </View>
                      <Text className="text-gray-700 text-sm mb-3 text-start leading-5" numberOfLines={2}>
                        {order.content}
                      </Text>
                      <View className="flex-row items-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                        <View
                          className={`px-3 py-1.5 rounded-lg ${
                            order.status === 'delivered'
                              ? 'bg-success-100'
                              : order.status === 'cancelled'
                              ? 'bg-error-100'
                              : 'bg-warning-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              order.status === 'delivered'
                                ? 'text-success-700'
                                : order.status === 'cancelled'
                                ? 'text-error-700'
                                : 'text-warning-700'
                            }`}
                          >
                            {getStatusText(order.status)}
                          </Text>
                        </View>
                        <Ionicons name="chevron-back" size={16} color="#9ca3af" />
                      </View>
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
                onPress={() => router.push('/(client)/orders/create')}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">إنشاء أول طلب</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
        
      </View>
    </ScrollView>
  );
}


