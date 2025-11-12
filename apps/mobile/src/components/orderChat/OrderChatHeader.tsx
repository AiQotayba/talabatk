import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderChatRole } from './types';
import { formatOrderId, getStatusText, getStatusColor } from './utils';

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
    return (
        <View className="bg-white border-b border-gray-200  px-4 py-4 flex-row items-start justify-between" style={{ direction: 'rtl' }}>
            <View className="flex-col items-center gap-4 h-20">
                <View className="flex-row items-center gap-4 mx-4">
                    <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                        <Ionicons name="arrow-forward" size={30} color="#374151" />
                    </TouchableOpacity>
                    <Ionicons name="receipt-outline" size={30} color="#E02020" />
                    <Text className="font-bold text-gray-900 text-base">{formatOrderId(order.code_order)}</Text>
                </View>
                <Text className="text-gray-500 text-sm">{order.client?.name || order.driver?.name}</Text>
            </View>
            <View className="flex-row items-center gap-3">
                <View className={`px-3 py-1 rounded-lg ${getStatusColor(order.status)}`}>
                    <Text className="text-xs font-semibold">{getStatusText(order.status)}</Text>
                </View>
                <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-vertical" size={30} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

