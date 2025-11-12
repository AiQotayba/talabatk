import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import OrderCard from '@/components/order/order-card';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Skeleton from '@/components/ui/Skeleton';

function OrderCardSkeleton() {
    return (
        <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <View className="flex-row items-center gap-3">
                <Skeleton width={48} height={48} borderRadius={24} />
                <View className="flex-1 gap-2">
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="50%" height={14} />
                </View>
            </View>
        </View>
    );
}

interface OrderGridProps {
    orders: Order[];
    isLoading: boolean;
    emptyMessage?: string;
}

export default function OrderGrid({ orders, isLoading, emptyMessage = 'لا يوجد طلبات' }: OrderGridProps) {
    if (isLoading) {
        return (
            <View className="flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index}>
                        <OrderCardSkeleton />
                    </View>
                ))}
            </View>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
                <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 text-right mt-4">{emptyMessage}</Text>
            </Animated.View>
        );
    }

    return (
        <View className="flex-col gap-3">
            {orders.map((order, index) => (
                <OrderCard key={order.id} order={order} index={index} role="admin" />
            ))}
        </View>
    );
}

