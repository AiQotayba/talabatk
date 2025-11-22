import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Logout from '@/components/atoms/logout';

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);


  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="bg-white px-6 py-8 my-10" style={{ direction: 'rtl' }}>
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-4">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center my-10 overflow-hidden" style={{
            shadowColor: '#E02020',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            {user?.profile_photo_url ? (
              <Image
                source={{ uri: user.profile_photo_url }}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color="#E02020" />
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</Text>
          <Text className="text-gray-600 text-base">{user?.email}</Text>
          <Text className="text-gray-600 text-base">{user?.phone}</Text>
        </Animated.View>
      </View>

      <View className="bg-white mb-4">
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/profile/edit')}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="person-outline" size={24} color="#E02020" />
            <Text className="ml-4 text-gray-900 flex-1 text-start font-medium">تعديل الملف الشخصي</Text>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
            activeOpacity={0.7}
            onPress={() => router.push('/(client)/addresses')}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="location-outline" size={24} color="#E02020" />
            <Text className="ml-4 text-gray-900 flex-1 text-start font-medium">عناويني</Text>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
            onPress={() => router.push('/(client)/notifications')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="notifications-outline" size={24} color="#E02020" />
            <Text className="ml-4 text-gray-900 flex-1 text-start font-medium">الإشعارات</Text>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View className="bg-white mb-4">
        <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
            onPress={() => router.push('/(client)/help-center')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="help-circle-outline" size={24} color="#E02020" />
            <Text className="ml-4 text-gray-900 flex-1 text-start font-medium">مركز المساعدة</Text>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <TouchableOpacity
            className="flex-row items-center px-6 py-4"
            onPress={() => router.push('/(client)/policy')}
            activeOpacity={0.7}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="document-text-outline" size={24} color="#E02020" />
            <Text className="ml-4 text-gray-900 flex-1 text-start font-medium">سياسة الخصوصية</Text>
            <Ionicons name="chevron-back" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View className="px-6 py-4">
        <Logout />
      </View>
    </ScrollView>
  );
}


