import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  index: number;
}

export default function StatCard({ title, value, icon, color, bgColor, change, index }: StatCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(600).delay(index * 100)} className="flex-1">
      <View className="bg-white rounded-xl p-4 shadow-sm" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center justify-between mb-3">
          <View className={`w-12 h-12 rounded-lg ${bgColor} items-center justify-center`}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          {change && (
            <View className={`flex-row items-center gap-1 ${change.isPositive ? 'bg-green-50' : 'bg-red-50'} px-2 py-1 rounded-lg`}>
              <Ionicons
                name={change.isPositive ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={change.isPositive ? '#16a34a' : '#dc2626'}
              />
              <Text className={`text-xs font-semibold ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change.value}
              </Text>
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-900 text-right mb-1">{value}</Text>
        </View>
        <Text className="text-sm text-gray-600 text-start">{title}</Text>
      </View>
    </Animated.View>
  );
}


