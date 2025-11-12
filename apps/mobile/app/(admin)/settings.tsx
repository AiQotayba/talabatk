import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';

export default function AdminSettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="الإعدادات" description="الإعدادات" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="cash-outline" size={24} color="#E02020" />
              <Text className="text-gray-900 font-semibold text-base text-right">أسعار التوصيل</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="time-outline" size={24} color="#E02020" />
              <Text className="text-gray-900 font-semibold text-base text-right">أوقات العمل</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="notifications-outline" size={24} color="#E02020" />
              <Text className="text-gray-900 font-semibold text-base text-right">إعدادات الإشعارات</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


