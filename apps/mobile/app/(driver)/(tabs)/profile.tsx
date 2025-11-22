import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Logout from '@/components/atoms/logout';

export default function DriverProfileScreen() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    return (
        <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
            <View className="bg-white px-6 py-8" style={{ direction: 'rtl' }}>
                <Animated.View entering={FadeInDown.duration(600)} className="items-center">
                    <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4 overflow-hidden">
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
                    <Text className="text-2xl font-bold text-gray-900 text-right mb-1">{user?.name}</Text>
                    <Text className="text-gray-600 text-base text-right">{user?.phone}</Text>
                    {user?.email && (
                        <Text className="text-gray-600 text-base text-right">{user.email}</Text>
                    )}
                </Animated.View>
            </View>

            <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <TouchableOpacity
                        className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => router.push('/(driver)/profile/edit')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="person-outline" size={24} color="#E02020" />
                            <Text className="text-gray-900 font-semibold text-base text-right">تعديل الملف الشخصي</Text>
                        </View>
                        <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(150)}>
                    <TouchableOpacity
                        className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => router.push('/(driver)/profile/feedback')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="chatbubble-outline" size={24} color="#E02020" />
                            <Text className="text-gray-900 font-semibold text-base text-right">إرسال ملاحظات</Text>
                        </View>
                        <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </Animated.View>
                <Logout />
            </View>
        </ScrollView>
    );
}

