import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ReadyMessagesProps {
    onSelectMessage: (message: string) => void;
    visible: boolean;
}

const READY_MESSAGES = [
    'وصلت إلى موقع الاستلام',
    'في الطريق إليك',
    'وصلت إلى موقعك',
    'أحتاج إلى مساعدة في العثور على العنوان',
    'سأكون هناك خلال 5 دقائق',
    'تأخر بسيط، سأكون هناك قريباً',
    'تم الاستلام من العميل',
    'في الطريق للتسليم',
    'وصلت إلى موقع التسليم',
    'تم التسليم بنجاح',
];

export default function ReadyMessages({ onSelectMessage, visible }: ReadyMessagesProps) {
    if (!visible) return null;

    return (
        <Animated.View entering={FadeInDown.duration(300)} className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-center gap-2 mb-3" style={{ direction: 'rtl' }}>
                <Ionicons name="chatbubbles-outline" size={18} color="#E02020" />
                <Text className="text-sm font-semibold text-gray-700 text-right">رسائل جاهزة</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ direction: 'rtl' }}>
                <View className="flex-row gap-2">
                    {READY_MESSAGES.map((message, index) => (
                        <TouchableOpacity
                            key={index}
                            className="bg-primary-50 border border-primary-200 px-4 py-2 rounded-full"
                            onPress={() => onSelectMessage(message)}
                            activeOpacity={0.7}
                        >
                            <Text className="text-primary-700 text-sm text-right">{message}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </Animated.View>
    );
}


