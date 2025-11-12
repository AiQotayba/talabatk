import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import StatCard from '@/components/admin/StatCard';
import QuickActionCard from '@/components/admin/QuickActionCard';
import Header from '@/components/ui/header';
import OrderGrid from '@/components/orders/order-grid';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Fetch dashboard stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data || {};
    },
  });

  const statsData = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalOrders || 0,
      icon: 'receipt-outline',
      color: '#E02020',
      bgColor: 'bg-primary-50',
      change: stats?.ordersChange ? { value: `${stats.ordersChange}%`, isPositive: stats.ordersChange > 0 } : undefined,
    },
    {
      title: 'الطلبات النشطة',
      value: stats?.activeOrders || 0,
      icon: 'time-outline',
      color: '#d97706',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'إجمالي المستخدمين',
      value: stats?.totalUsers || 0,
      icon: 'people-outline',
      color: '#2563eb',
      bgColor: 'bg-blue-50',
      change: stats?.usersChange ? { value: `${stats.usersChange}%`, isPositive: stats.usersChange > 0 } : undefined,
    },
    {
      title: 'السائقين النشطين',
      value: stats?.activeDrivers || 0,
      icon: 'car-outline',
      color: '#16a34a',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الإيرادات اليوم',
      value: stats?.todayRevenue ? `${stats.todayRevenue} ل.س` : '0 ل.س',
      icon: 'cash-outline',
      color: '#7c3aed',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'الإيرادات الشهرية',
      value: stats?.monthlyRevenue ? `${stats.monthlyRevenue} ل.س` : '0 ل.س',
      icon: 'wallet-outline',
      color: '#dc2626',
      bgColor: 'bg-red-50',
    },
  ];

  const quickActions = [
    {
      title: '  الطلبات',
      icon: 'receipt', 
      bgColor: 'bg-primary-600/10',
      onPress: () => router.push('/(admin)/orders' as any),
    },
    {
      title: '  المستخدمين',
      icon: 'people',
      bgColor: 'bg-blue-600/10',
      onPress: () => router.push('/(admin)/users' as any),
    },
    {
      title: 'التحليلات',
      icon: 'stats-chart',
      bgColor: 'bg-green-600/10',
      onPress: () => router.push('/(admin)/analytics' as any),
    },
    {
      title: 'الخريطة',
      icon: 'map',
      bgColor: 'bg-orange-600/10',
      onPress: () => router.push('/(admin)/map' as any),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title={`أهلاً بك، ${user?.name}`} description="نظرة عامة على النظام" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {/* Stats Grid */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 text-start mb-4">الإحصائيات</Text>
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#E02020" />
              <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {statsData.map((stat, index) => (
                <View key={index} className="w-[48%]">
                  <StatCard {...stat} index={index} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 text-start mb-4">إجراءات سريعة</Text>
          <View className="flex-row flex-wrap gap-3">
            {quickActions.map((action, index) => (
              <View key={index} className="w-[48%]">
                <QuickActionCard {...action} index={index} />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900 text-right">آخر الطلبات</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/orders' as any)}>
              <Text className="text-primary-600 font-semibold text-sm">عرض الكل</Text>
            </TouchableOpacity>
          </View>
          <OrderGrid orders={stats?.recentOrders || []} isLoading={isLoading} />
          {/* TODO: Add recent orders list */}
        </View>
      </View>
    </ScrollView>
  );
}

