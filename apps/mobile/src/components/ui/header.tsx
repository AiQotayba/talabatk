import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface HeaderProps {
    title: string;
    description?: string;
}

export default function Header({ title, description }: HeaderProps) {
    return (

        <View className="bg-white px-6 py-8" style={{ direction: 'rtl' }}>
            <Animated.View entering={FadeInDown.duration(600)}>
                <Text className="text-3xl font-bold text-gray-900 text-start mb-2">
                    {title}
                </Text>
                {description && (
                    <Text className="text-gray-600 text-base text-start">
                        {description}
                    </Text>
                )}
            </Animated.View>
        </View>

    )
}