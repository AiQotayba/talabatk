import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order, FeaturedOrder } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import FeaturedOrdersSlider from '@/components/featured/FeaturedOrdersSlider';
import { useRef, useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Banner {
  id: string;
  title?: string;
  image_url: string;
  link?: string;
  order_index: number;
  is_active: boolean;
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const screenWidth = 350 + 12; // banner width + margin

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['client-orders', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/orders/client/history?limit=5');
      return response.data || [];
    },
  });

  // Fetch featured orders from API
  const { data: featuredOrdersData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featured-orders'],
    queryFn: async () => {
      const response = await apiClient.get<FeaturedOrder[]>('/users/featured-order');
      return response.data || [];
    },
  });

  // Fetch banners from API
  const { data: bannersData, isLoading: isLoadingBanners } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await apiClient.get<Banner[]>('/users/banners');
      return response.data || [];
    },
  });

  const BANNERS = bannersData || [];

  // Auto-scroll banners every 5 seconds
  useEffect(() => {
    if (BANNERS.length === 0 || BANNERS.length === 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = prev + 1;
        // Loop back to start when reaching the end
        return nextIndex >= BANNERS.length ? 0 : nextIndex;
      });
    }, 5000); // 5 seconds between each banner

    return () => clearInterval(interval);
  }, [BANNERS.length]);

  // Scroll to current banner index (RTL-aware)
  useEffect(() => {
    if (scrollViewRef.current && BANNERS.length > 0 && currentBannerIndex >= 0) {
      // For RTL: calculate position from right to left
      // Index 0 should be at the rightmost position
      const totalWidth = BANNERS.length * screenWidth;
      const scrollPosition = totalWidth - ((currentBannerIndex + 1) * screenWidth);
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  }, [currentBannerIndex, screenWidth, BANNERS.length]);

  // Listen to real-time order updates via Socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for order status updates
    const handleOrderUpdate = (updatedOrder: Order) => {
      // Check if this order is in our recent orders list
      if (ordersData?.some(order => order.id === updatedOrder.id)) {
        // Invalidate and refetch orders
        queryClient.invalidateQueries({ queryKey: ['client-orders', 'recent'] });
        // Also invalidate the specific order
        queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
      }
    };

    // Listen for new order created
    const handleOrderCreated = (newOrder: Order) => {
      // If the new order belongs to current user, refresh the list
      if (newOrder.client_id === user?.id) {
        queryClient.invalidateQueries({ queryKey: ['client-orders', 'recent'] });
      }
    };

    // Listen for order status changes
    socket.on('order_status_updated', handleOrderUpdate);
    socket.on('order_updated', handleOrderUpdate);
    socket.on('order_created', handleOrderCreated);

    return () => {
      socket.off('order_status_updated', handleOrderUpdate);
      socket.off('order_updated', handleOrderUpdate);
      socket.off('order_created', handleOrderCreated);
    };
  }, [socket, isConnected, ordersData, user?.id, queryClient]);

  return (
    <ScrollView
      className="flex-1 my-8 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      {/* <Header title={`أهلاً بك، ${user?.name}`} description="شو بدك تطلب اليوم؟" /> */}

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {/* Banners */}
        {BANNERS.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300).delay(50)} className="mb-6">
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={false}
              decelerationRate="fast"
              className="rounded-xl"
              style={{ direction: 'rtl' }}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                // For RTL: calculate index from right to left
                const totalWidth = BANNERS.length * screenWidth;
                const scrollFromRight = totalWidth - offsetX;
                const index = Math.round(scrollFromRight / screenWidth) - 1;
                // Ensure index is within bounds
                const clampedIndex = Math.max(0, Math.min(index, BANNERS.length - 1));
                setCurrentBannerIndex(clampedIndex);
              }}
            >
              {BANNERS.map((banner, index) => (
                <TouchableOpacity
                  key={banner.id}
                  className="ml-3 rounded-xl overflow-hidden"
                  onPress={() => {
                    if (banner.link) {
                      router.push(banner.link as any);
                    }
                  }}
                  activeOpacity={banner.link ? 0.9 : 1}
                  style={{ width: 350, height: 180 }}
                >
                  <Image
                    source={{ uri: banner.image_url }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Create New Order Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl py-6 px-6 mb-6"
            onPress={() => router.push('/(client)/orders/create')}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#E02020',
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between gap-2">
              <View className="bg-white/20 rounded-full p-3">
                <Ionicons name="add-circle" size={28} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-start font-bold text-xl mb-1">
                  إنشاء طلب جديد
                </Text>
                <Text className="text-primary-100 text-start text-sm">
                  اطلب ما تحتاجه بسهولة
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Featured Orders */}
        <FeaturedOrdersSlider
          featuredOrders={featuredOrdersData || []}
          isLoading={isLoadingFeatured}
        />

        {/* Recent Orders */}
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


