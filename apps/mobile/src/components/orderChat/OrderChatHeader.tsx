import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderChatRole } from './types';
import { formatOrderId, getStatusText, getStatusColor, getStatusIcon } from './utils';
import GetStatus from '../atoms/GetStatus';

interface OrderChatHeaderProps {
    order: Order;
    role: OrderChatRole;
    onBack: () => void;
    onMenuPress: () => void;
}

export default function OrderChatHeader({
    order,
    role,
    onBack,
    onMenuPress,
}: OrderChatHeaderProps) {
    const otherUserName = role === 'driver' ? order.client?.name : order.driver?.name;

    return (
        <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center justify-between h-20 pt-6" style={{ direction: 'rtl' }}>
            <View className="flex-row items-center gap-3 flex-1">
                <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-forward" size={24} color="#374151" />
                </TouchableOpacity>
                <Ionicons name="receipt-outline" size={20} color="#E02020" />
                <View className="flex-col items-start">
                    <Text className="font-bold text-gray-900 text-base">{formatOrderId(order.code_order)}</Text>
                    {otherUserName && (
                        <Text className="text-gray-500 text-sm text-start mt-1">{otherUserName}</Text>
                    )}
                </View>
            </View>
            <View className="flex-row items-center gap-3">
                <GetStatus name={order.status} />
                <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

