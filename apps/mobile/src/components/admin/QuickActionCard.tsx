import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface QuickActionCardProps {
  title: string;
  icon: string;
  color?: string;
  bgColor: string;
  onPress: () => void;
  index: number;
}

export default function QuickActionCard({ title, icon, color, bgColor, onPress, index }: QuickActionCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(600).delay(index * 100)} className="flex-1">
      <TouchableOpacity
        className={`${bgColor} rounded-xl p-4 items-center justify-start flex-row gap-2`}
        onPress={onPress}
        activeOpacity={0.8}
        style={{ direction: 'rtl' }}
      >
        <View className={`w-14 h-14 rounded-full bg-primary-600/50 items-center justify-center`}>
          <Ionicons name={icon as any} size={28} color={"#fff"} className={ `${color ? color : 'text-gray-900'}` } />
        </View>
        <Text className={`text-md font-bold text-start ${color || 'text-primary-600'}`}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}


