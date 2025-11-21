import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/order/order-card';
import { useRef, useEffect, useState } from 'react';

// Mock banner data - replace with actual API call
const BANNERS = [
  { id: 1, image: 'https://i.ytimg.com/vi/xkUtZQZKork/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBDfToSo75RUVbIsR7MZFLFF-dOkg', link: '/(client)/orders/create' },
  { id: 2, image: 'https://i.ytimg.com/vi/8WITSihkoqo/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLB_cnnSHmnYIo8QP1xX7OfhbSkhZw', link: '/(client)/orders/create' },
];

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);
  const bannerWidth = 350 + 12; // width + margin
  // Start from middle set for infinite scroll in both directions
  const [currentBannerIndex, setCurrentBannerIndex] = useState(BANNERS.length);

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['client-orders', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/orders/client/history?limit=5');
      return response.data || [];
    },
  });

  // Featured orders (completed and active orders)
  const featuredOrders = ordersData?.filter(
    (order) => order.status === 'delivered' || order.status === 'accepted' || order.status === 'in_transit'
  ) || [];

  // Create infinite banners (duplicate for seamless loop)
  const infiniteBanners = [...BANNERS, ...BANNERS, ...BANNERS];

  // Calculate scroll position for RTL (from right to left)
  const getRTLScrollPosition = (index: number) => {
    const totalWidth = infiniteBanners.length * bannerWidth;
    return totalWidth - (index * bannerWidth) - bannerWidth;
  };

  // Initialize scroll position to middle set (RTL)
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        const initialPosition = getRTLScrollPosition(BANNERS.length);
        scrollViewRef.current?.scrollTo({
          x: initialPosition,
          animated: false,
        });
      }, 100);
    }
  }, [bannerWidth]);

  // Auto-scroll banners every 4 seconds (RTL - from right to left)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = prev + 1;
        // If we've scrolled to the end of second set, jump back to start of second set
        if (nextIndex >= BANNERS.length * 2) {
          setTimeout(() => {
            const resetPosition = getRTLScrollPosition(BANNERS.length);
            scrollViewRef.current?.scrollTo({ 
              x: resetPosition, 
              animated: false 
            });
            setCurrentBannerIndex(BANNERS.length);
          }, 50);
          return BANNERS.length;
        }
        return nextIndex;
      });
    }, 4000); // Changed from 3000 to 4000 (4 seconds)

    return () => clearInterval(interval);
  }, [bannerWidth]);

  // Scroll to current banner index (RTL)
  useEffect(() => {
    if (scrollViewRef.current) {
      const scrollPosition = getRTLScrollPosition(currentBannerIndex);
      scrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true,
      });
    }
  }, [currentBannerIndex, bannerWidth]);

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
        <Animated.View entering={FadeInDown.duration(3000).delay(50)} className="mb-6">
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
            className="rounded-xl"
            style={{ direction: 'rtl' }}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              // For RTL, calculate index from right to left
              const totalWidth = infiniteBanners.length * bannerWidth;
              const scrollFromRight = totalWidth - offsetX;
              const index = Math.round(scrollFromRight / bannerWidth);
              setCurrentBannerIndex(index);
            }}
          >
            {infiniteBanners.map((banner, index) => (
              <TouchableOpacity
                key={`${banner.id}-${index}`}
                className="ml-3 rounded-xl overflow-hidden"
                onPress={() => router.push(banner.link as any)}
                activeOpacity={0.9}
                style={{ width: 350, height: 180 }}
              >
                <Image
                  source={{ uri: banner.image }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Create New Order Button */}
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

        {/* Featured Orders */}
        {featuredOrders.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900 text-start">الطلبات المميزة</Text>
              <TouchableOpacity onPress={() => router.push('/(client)/orders' as any)}>
                <Text className="text-primary-600 text-sm font-semibold">عرض الكل</Text>
              </TouchableOpacity>
            </View>
            {featuredOrders.slice(0, 3).map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </View>
        )}

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


