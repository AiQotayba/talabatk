import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Order } from '@/types/order.types';
import OrderCard from '@/components/order/order-card';

interface UserDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'client' | 'driver' | 'admin';
    profile_photo_url?: string;
    created_at: string;
    orders?: Order[];
    stats?: {
        total_orders?: number;
        completed_orders?: number;
        average_rating?: number;
    };
}

export default function AdminUserDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: UserDetails }>(`/admin/users/${id}`);
            return response.data?.data;
        },
        enabled: !!id,
    });

    const user = userData as UserDetails | undefined;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#E02020" />
                <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Ionicons name="person-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 mt-4 text-right">المستخدم غير موجود</Text>
                <TouchableOpacity
                    className="mt-4 bg-primary-600 rounded-xl px-6 py-3"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-semibold">العودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
            style={{ direction: 'rtl' }}
        >
            <View className="bg-white px-6 py-8" style={{ direction: 'rtl' }}>
                <Animated.View entering={FadeInDown.duration(600)} className="items-center">
                    <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4 overflow-hidden">
                        {user.profile_photo_url ? (
                            <Image
                                source={{ uri: user.profile_photo_url }}
                                className="w-24 h-24 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="person" size={48} color="#E02020" />
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-right mb-1">{user.name}</Text>
                    <Text className="text-gray-600 text-base text-right">{user.phone}</Text>
                    {user.email && (
                        <Text className="text-gray-600 text-base text-right">{user.email}</Text>
                    )}
                    <View className={`mt-3 px-4 py-2 rounded-full ${user.role === 'client' ? 'bg-blue-100' :
                        user.role === 'driver' ? 'bg-green-100' :
                            'bg-purple-100'
                        }`}>
                        <Text className={`font-semibold text-sm ${user.role === 'client' ? 'text-blue-700' :
                            user.role === 'driver' ? 'text-green-700' :
                                'text-purple-700'
                            }`}>
                            {user.role === 'client' ? 'عميل' : user.role === 'driver' ? 'سائق' : 'مدير'}
                        </Text>
                    </View>
                </Animated.View>
            </View>

            {user.stats && (
                <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                    <Text className="text-xl font-bold text-gray-900 text-right mb-4">الإحصائيات</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {user.stats.total_orders !== undefined && (
                            <View className="w-[48%] bg-white rounded-xl p-4">
                                <Text className="text-2xl font-bold text-gray-900 text-right mb-1">
                                    {user.stats.total_orders}
                                </Text>
                                <Text className="text-sm text-gray-600 text-right">إجمالي الطلبات</Text>
                            </View>
                        )}
                        {user.stats.completed_orders !== undefined && (
                            <View className="w-[48%] bg-white rounded-xl p-4">
                                <Text className="text-2xl font-bold text-gray-900 text-right mb-1">
                                    {user.stats.completed_orders}
                                </Text>
                                <Text className="text-sm text-gray-600 text-right">الطلبات المكتملة</Text>
                            </View>
                        )}
                        {user.stats.average_rating !== undefined && (
                            <View className="w-[48%] bg-white rounded-xl p-4">
                                <Text className="text-2xl font-bold text-gray-900 text-right mb-1">
                                    {user.stats.average_rating.toFixed(1)}
                                </Text>
                                <Text className="text-sm text-gray-600 text-right">التقييم المتوسط</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {user.orders && user.orders.length > 0 && (
                <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                    <Text className="text-xl font-bold text-gray-900 text-right mb-4">الطلبات</Text>
                    {user.orders.map((order, index) => (
                        <OrderCard key={order.id} order={order} index={index} role="admin" />
                    ))}
                </View>
            )}

            <View className="px-6 py-4" style={{ direction: 'rtl' }}>
                <Text className="text-sm text-gray-500 text-right">
                    تاريخ التسجيل: {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </Text>
            </View>
        </ScrollView>
    );
}

