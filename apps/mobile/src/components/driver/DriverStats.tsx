import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DriverStatsProps {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
}

export default function DriverStats({ totalOrders, completedOrders, pendingOrders }: DriverStatsProps) {
    const stats = [
        {
            label: 'إجمالي الطلبات',
            value: totalOrders,
            icon: 'receipt-outline',
            color: '#E02020',
            bgColor: 'bg-primary-50',
        },
        {
            label: 'مكتملة',
            value: completedOrders,
            icon: 'checkmark-circle-outline',
            color: '#16a34a',
            bgColor: 'bg-green-50',
        },
        {
            label: 'معلقة',
            value: pendingOrders,
            icon: 'time-outline',
            color: '#d97706',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mb-6">
            <View className="bg-white rounded-2xl p-5 shadow-sm" style={{ direction: 'rtl' }}>
                <Text className="text-lg font-bold text-gray-900 text-right mb-4">الإحصائيات</Text>
                <View className="flex-row gap-3">
                    {stats.map((stat, index) => (
                        <View key={index} className={`flex-1 rounded-xl p-4 ${stat.bgColor}`}>
                            <View className="items-center">
                                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                                <Text className="text-2xl font-bold mt-2" style={{ color: stat.color }}>
                                    {stat.value}
                                </Text>
                                <Text className="text-xs text-gray-600 mt-1 text-center">{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

