import { Link, router } from "expo-router";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { Order } from "@/types/order.types";
import Animated, { FadeInDown } from 'react-native-reanimated';
import GetStatus from "../atoms/GetStatus";
import TimeHistory from "../atoms/TimeHistory";



interface OrderCardProps {
    order: Order;
    index: number;
    role?: 'client' | 'driver' | 'admin';
}

export default function OrderCard({ order, index, role = 'client' }: OrderCardProps) {

    let pathname = `/(client)/orders/${order.id}`;
    if (role === 'driver') pathname = `/(driver)/orders/${order.id}`;
    else if (role === 'admin') pathname = `/(admin)/orders/${order.id}`;

    return (
        <Animated.View
            key={order.id}
            entering={FadeInDown.duration(400).delay(index * 50)}
        >
            <Link
                href={pathname as any}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 w-full"
            >
                <View className="flex-row justify-between items-start mb-2" >
                    <View className="flex-1">
                        <View className="flex-row justify-between items-center gap-2">
                            <View className="flex-row items-center gap-2 mb-2" >
                                <Ionicons name="receipt-outline" size={20} color="#E02020" />
                                <Text className="font-bold text-gray-900 text-base">
                                    طلب #{order.code_order}
                                </Text>
                            </View>
                            <GetStatus name={order.status} />
                        </View>
                        <Text className="text-gray-700 text-sm mb-2 text-start" numberOfLines={2}>
                            {order.content}
                        </Text>
                        <TimeHistory
                            createdAt={order.created_at}
                            showIcon={true}
                            iconColor="#9ca3af"
                            textClassName="text-gray-500 text-xs"
                        />
                        {(order as any).cancel_reason && order.status === 'cancelled' && (
                            <View className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                <Text className="text-red-700 text-xs text-start">
                                    <Text className="font-semibold">سبب الإلغاء: </Text>
                                    {(order as any).cancel_reason}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Re-order button for delivered or active orders */}
                {role === 'client' && (order.status === 'delivered' || order.status === 'accepted' || order.status === 'in_transit') && (
                    <Link
                        href={{
                            pathname: '/(client)/orders/create',
                            params: { reorder: order.id }
                        }}
                        className="mt-3 bg-primary-50 border border-primary-200 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2"
                    >
                        <Ionicons name="refresh" size={16} color="#E02020" />
                        <Text className="text-primary-600 font-semibold text-sm">إعادة الطلب</Text>
                    </Link>
                )}
            </Link>
        </Animated.View>
    )
}