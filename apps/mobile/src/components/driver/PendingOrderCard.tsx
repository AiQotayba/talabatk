import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Order } from '@/types/order.types';
import OrderDetailsDialog from './OrderDetailsDialog';
import TimeHistory from '../atoms/TimeHistory';

interface PendingOrderCardProps {
    order: Order;
    index: number;
    onAccept?: (orderId: string) => void;
    onReject?: (orderId: string) => void;
}

export default function PendingOrderCard({ order, index, onAccept, onReject }: PendingOrderCardProps) {
    const [showDialog, setShowDialog] = useState(false);
    
    // Calculate minutes for color logic
    const getTimeColor = () => {
        const now = new Date().getTime();
        const created = new Date(order.created_at).getTime();
        const minutes = Math.floor((now - created) / 1000 / 60);
        
        if (minutes > 30) return '#dc2626'; // أحمر - أكثر من نصف ساعة
        if (minutes > 15) return '#f97316'; // برتقالي - أكثر من ربع ساعة
        return '#9ca3af'; // رمادي - أقل من ربع ساعة
    };
    
    const timeColor = getTimeColor();

    return (
        <>
            <Animated.View entering={FadeInDown.duration(600).delay(index * 100)}>
                <TouchableOpacity
                    className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                    onPress={() => setShowDialog(true)}
                    activeOpacity={0.7}
                    style={{ direction: 'rtl' }}
                >
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center gap-2 mb-2">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="receipt-outline" size={20} color="#E02020" />
                                    <Text className="font-bold text-gray-900 text-base">طلب #{order.code_order || order.id.slice(0, 8)}</Text>
                                </View>

                                <TimeHistory
                                    createdAt={order.created_at}
                                    showIcon={true}
                                    iconColor={timeColor}
                                    textClassName="text-xs text-right font-mono"
                                    textStyle={{ color: timeColor }}
                                    iconSize={14}
                                />
                            </View>
                            <Text className="text-gray-700 text-sm mb-2 text-start" numberOfLines={3}>
                                {order.content}
                            </Text>
                            {(order as any).address && (
                                <View className="flex-row items-center gap-2 mt-2">
                                    <Ionicons name="location" size={16} color="#E02020" />
                                    <Text className="text-gray-600 text-xs text-start flex-1">
                                        {(order as any).address.city}, {(order as any).address.street}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <OrderDetailsDialog
                visible={showDialog}
                order={order}
                onClose={() => setShowDialog(false)}
                onAccept={(orderId) => {
                    setShowDialog(false);
                    onAccept?.(orderId);
                }}
                onReject={(orderId) => {
                    setShowDialog(false);
                    onReject?.(orderId);
                }}
            />
        </>
    );
}

