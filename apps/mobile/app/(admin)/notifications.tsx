import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';

interface Notification {
  id: string;
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
}

export default function AdminNotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await apiClient.get<Notification[]>('/admin/notifications');
      return response.data || [];
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="الإشعارات" description="جميع الإشعارات والتنبيهات" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
          </View>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              entering={FadeInDown.duration(600).delay(index * 50)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-start gap-3">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  notification.read_at ? 'bg-gray-100' : 'bg-primary-100'
                }`}>
                  <Ionicons
                    name={notification.read_at ? 'notifications-outline' : 'notifications'}
                    size={20}
                    color={notification.read_at ? '#9ca3af' : '#E02020'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-right mb-1">{notification.title}</Text>
                  <Text className="text-gray-700 text-sm text-right mb-2">{notification.message}</Text>
                  <Text className="text-gray-400 text-xs text-right">
                    {new Date(notification.created_at).toLocaleString('ar-SA')}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
            <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-right mt-4">لا توجد إشعارات حالياً</Text>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}


