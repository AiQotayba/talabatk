import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface TrustItem {
    id: number;
    title: string;
    description: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
}

const trustItems: TrustItem[] = [
    {
        id: 1,
        title: 'آمن ومضمون',
        description: 'جميع المعاملات محمية ومشفرة',
        iconName: 'shield-checkmark',
        iconColor: '#ffffff',
        iconBg: '#16a34a',
    },
    {
        id: 2,
        title: 'توصيل موثوق',
        description: 'ضمان وصول طلبك في الوقت المحدد',
        iconName: 'time',
        iconColor: '#ffffff',
        iconBg: '#E02020',
    },
    {
        id: 3,
        title: 'دعم فوري',
        description: 'فريق دعم متاح 24/7 لمساعدتك',
        iconName: 'headset',
        iconColor: '#ffffff',
        iconBg: '#2563eb',
    },
];

export function TrustScreen({ onNext }: { onNext: () => void }) {
    return (
        <View className="flex-1 bg-white px-6 py-12">
            <View className="flex-1 justify-center">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                    موثوق وآمن
                </Text>
                <Text className="text-gray-600 text-center mb-12 text-base">
                    نحن نضمن لك تجربة آمنة وموثوقة
                </Text>

                <View className="gap-6">
                    {trustItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeIn.delay(index * 200).duration(400)}
                            className="flex-row items-center gap-4 bg-gray-50 rounded-2xl p-5 border-2 border-gray-200"
                            style={{ direction: 'rtl' }}
                        >
                            <View
                                className="rounded-2xl p-4 items-center justify-center"
                                style={{ backgroundColor: item.iconBg }}
                            >
                                <Ionicons
                                    name={item.iconName}
                                    size={32}
                                    color={item.iconColor}
                                />
                            </View>
                            <View className="flex-1" style={{ alignItems: 'flex-start' }}>
                                <Text className="text-xl font-bold text-gray-900 mb-1">
                                    {item.title}
                                </Text>
                                <Text className="text-gray-600 text-base leading-6 text-right">
                                    {item.description}
                                </Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </View>
            <TouchableOpacity onPress={onNext}>
                <View className="bg-primary-600 rounded-lg p-4">
                    <Text className="text-white text-center text-base">ابدأ الآن</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
