import { View, Text, ScrollView } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';

export default function NotificationsScreen() {
  const { notifications } = useAppSelector((state) => state.notifications);

  return (
    <View className="flex-1 my-10 bg-gray-50">
      <Header title="الإشعارات" description="جميع الإشعارات والتنبيهات" />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              entering={FadeInDown.duration(400).delay(index * 50)}
            >
              <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row items-start gap-3" style={{ flexDirection: 'row' }}>
                  <View className="bg-primary-100 rounded-full p-2 mt-1">
                    <Ionicons name="notifications" size={20} color="#E02020" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1 text-start text-base">
                      {notification.title}
                    </Text>
                    <Text className="text-gray-700 mb-2 text-start text-sm leading-5">
                      {notification.body}
                    </Text>
                    <View className="flex-row items-center gap-1" style={{ flexDirection: 'row' }}>
                      <Ionicons name="time-outline" size={12} color="#9ca3af" />
                      <Text className="text-gray-500 text-xs">
                        {new Date(notification.created_at).toLocaleString('ar-SA')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-16 items-center">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            </View>
            <Text className="text-gray-500 text-center text-base">ما عندك إشعارات حالياً</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}


