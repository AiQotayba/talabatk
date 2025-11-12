import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Order } from '@/types/order.types';

interface PendingOrderCardProps {
    order: Order;
    index: number;
    onAccept?: (orderId: string) => void;
    onReject?: (orderId: string) => void;
}

export default function PendingOrderCard({ order, index, onAccept, onReject }: PendingOrderCardProps) {
    const router = useRouter();

    return (
        <Animated.View entering={FadeInDown.duration(600).delay(index * 100)}>
            <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                onPress={() => router.push(`/(driver)/orders/${order.id}` as any)}
                activeOpacity={0.7}
                style={{ direction: 'rtl' }}
            >
                <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons name="receipt-outline" size={20} color="#E02020" />
                            <Text className="font-bold text-gray-900 text-base">طلب #{order.code_order || order.id.slice(0, 8)}</Text>
                        </View>
                        <Text className="text-gray-700 text-sm mb-2 text-right" numberOfLines={2}>
                            {order.content}
                        </Text>
                        {order.dropoff_address && (
                            <View className="flex-row items-center gap-2 mt-2">
                                <Ionicons name="location" size={16} color="#E02020" />
                                <Text className="text-gray-600 text-xs text-right flex-1">
                                    {order.dropoff_address.city}, {order.dropoff_address.street}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <Text className="text-xs text-gray-500 text-right">
                        {new Date(order.created_at).toLocaleString('ar-SA', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            className="bg-red-50 px-4 py-2 rounded-lg"
                            onPress={(e) => {
                                e.stopPropagation();
                                onReject?.(order.id);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text className="text-red-600 font-semibold text-sm">رفض</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-primary-600 px-4 py-2 rounded-lg"
                            onPress={(e) => {
                                e.stopPropagation();
                                onAccept?.(order.id);
                            }}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-semibold text-sm">قبول</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

