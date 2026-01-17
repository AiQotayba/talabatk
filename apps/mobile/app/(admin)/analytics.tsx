import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StatCard from '@/components/admin/StatCard';
import Header from '@/components/ui/header';

export default function AdminAnalyticsScreen() {
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics');
      return response.data || {};
    },
  });

  const analyticsData = [
    {
      title: 'طلبات اليوم',
      value: analytics?.todayOrders || 0,
      icon: 'today-outline',
      color: '#E02020',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'طلبات هذا الشهر',
      value: analytics?.monthlyOrders || 0,
      icon: 'calendar-outline',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'معدل الإتمام',
      value: analytics?.completionRate ? `${analytics.completionRate}%` : '0%',
      icon: 'checkmark-circle-outline',
      color: '#16a34a',
      bgColor: 'bg-green-50',
    },
    {
      title: 'معدل الإلغاء',
      value: analytics?.cancellationRate ? `${analytics.cancellationRate}%` : '0%',
      icon: 'close-circle-outline',
      color: '#dc2626',
      bgColor: 'bg-red-50',
    },
    {
      title: 'متوسط وقت التوصيل',
      value: analytics?.avgDeliveryTime ? `${analytics.avgDeliveryTime} دقيقة` : '0 دقيقة',
      icon: 'time-outline',
      color: '#d97706',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'التقييم المتوسط',
      value: analytics?.avgRating ? analytics.avgRating.toFixed(1) : '0.0',
      icon: 'star-outline',
      color: '#7c3aed',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="التحليلات والإحصائيات" description="نظرة شاملة على أداء النظام" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {analyticsData.map((stat, index) => (
              <View key={index} className="w-[48%]">
                <StatCard {...stat} index={index} />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}


