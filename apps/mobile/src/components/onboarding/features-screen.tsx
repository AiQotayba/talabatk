import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Feature {
    id: number;
    title: string;
    description: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    gradientStart: string;
    gradientEnd: string;
}

const features: Feature[] = [
    {
        id: 1,
        title: 'اطلب أي حاجة',
        description: 'بدون قوائم أو قيود، اكتب اسم الشيء اللي بدك إياه',
        iconName: 'create',
        iconColor: '#ffffff',
        iconBg: '#E02020',
        gradientStart: '#ef4444',
        gradientEnd: '#C91C1C',
    },
    {
        id: 2,
        title: 'توصيل بسرعة',
        description: 'متوسط التوصيل 10-15 دقيقة مع تواصل مباشر',
        iconName: 'flash',
        iconColor: '#ffffff',
        iconBg: '#16a34a',
        gradientStart: '#22c55e',
        gradientEnd: '#15803d',
    },
    {
        id: 3,
        title: 'تواصل مباشر',
        description: 'محادثة مع فريق الدعم والمندوب لحظة بلحظة',
        iconName: 'chatbubbles',
        iconColor: '#ffffff',
        iconBg: '#E02020',
        gradientStart: '#ef4444',
        gradientEnd: '#C91C1C',
    },
];

export function FeaturesScreen({ onNext }: { onNext: () => void }) {
    const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

    return (
        <View className="flex-1 bg-white px-6 py-12">
            <View className="flex-1 justify-center">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                    الميزات
                </Text>
                <Text className="text-gray-600 text-center mb-12 text-base">
                    اضغط على أي ميزة عشان تتعرف عليها
                </Text>

                <View className="gap-6">
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            // onPress={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
                            className={`rounded-2xl p-5 border-2 ${
                                selectedFeature === feature.id
                                    ? 'bg-white border-primary-600 shadow-lg'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                            activeOpacity={0.7}
                            style={{ direction: 'rtl' }}
                        >
                            <View className="flex-row items-center gap-4" style={{ flexDirection: 'row' }}>
                                <View
                                    className="rounded-2xl p-4 items-center justify-center"
                                    style={{ backgroundColor: feature.iconBg }}
                                >
                                    <Ionicons
                                        name={feature.iconName}
                                        size={32}
                                        color={feature.iconColor}
                                    />
                                </View>
                                <View className="flex-1" style={{ alignItems: 'flex-start' }}>
                                    <Text className="text-xl font-bold text-gray-900 mb-1">
                                        {feature.title}
                                    </Text>
                                    {selectedFeature === feature.id && (
                                        <Animated.View
                                            entering={FadeIn.duration(300)}
                                            exiting={FadeOut.duration(200)}
                                        >
                                            <Text className="text-gray-600 text-base mt-2 leading-6 text-right">
                                                {feature.description}
                                            </Text>
                                        </Animated.View>
                                    )}
                                </View>
                                {selectedFeature === feature.id && (
                                    <View>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color="#E02020"
                                        />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <TouchableOpacity onPress={onNext}>
                <View className="bg-primary-600 rounded-lg p-4">
                    <Text className="text-white text-center text-base">التالي</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

