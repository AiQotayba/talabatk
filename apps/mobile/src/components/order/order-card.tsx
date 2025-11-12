import { router } from "expo-router";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { Order } from "@/types/order.types";
import Animated, { FadeInDown } from 'react-native-reanimated';



interface OrderCardProps {
  order: Order;
  index: number;
  role?: 'client' | 'driver' | 'admin';
}

export default function OrderCard({ order, index, role = 'client' }: OrderCardProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-success-100 text-success-700';
            case 'cancelled':
            case 'failed':
                return 'bg-error-100 text-error-700';
            case 'pending':
            case 'assigned':
                return 'bg-warning-100 text-warning-700';
            default:
                return 'bg-primary-100 text-primary-700';
        }
    };
    const getStatusText = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'تم التسليم';
            case 'cancelled':
                return 'ملغي';
            case 'failed':
                return 'فشل';
            case 'pending':
                return 'قيد الإنتظار';
            case 'assigned':
                return 'معاينة السائق';
            default:
                return status;
        }
    };

    return (
        <Animated.View
            key={order.id}
            entering={FadeInDown.duration(400).delay(index * 50)}
        >
            <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                onPress={() => {
                    let route = `/(client)/orders/${order.id}`;
                    if (role === 'driver') {
                        route = `/(driver)/orders/${order.id}`;
                    } else if (role === 'admin') {
                        route = `/(admin)/orders/${order.id}`;
                    }
                    router.push(route as any);
                }}
                activeOpacity={0.7}
            >
                <View className="flex-row justify-between items-start mb-2" >
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2" >
                            <Ionicons name="receipt-outline" size={20} color="#E02020" />
                            <Text className="font-bold text-gray-900 text-base">
                                طلب #{order.code_order}
                            </Text>
                        </View>
                        <Text className="text-gray-700 text-sm mb-2 text-start" numberOfLines={2}>
                            {order.content}
                        </Text>
                        <View className="flex-row items-center gap-2" >
                            <Ionicons name="time-outline" size={14} color="#9ca3af" />
                            <Text className="text-gray-500 text-xs">
                                {new Date(order.created_at).toLocaleDateString('ar-SA')}
                            </Text>
                        </View>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${getStatusColor(order.status)}`}>
                        <Text className="text-xs font-semibold">{getStatusText(order.status)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}