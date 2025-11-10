import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'support' | 'driver';
    delay: number;
}

const messages: Message[] = [
    { id: 1, text: 'السلام عليكم بدي 3 شاورما على مشفى الحسن ', sender: 'user', delay: 500 },
    { id: 2, text: 'وعليكم السلام, الطلب قيد التحضير ', sender: 'support', delay: 500 },
    { id: 3, text: ' مرحبا انا خالد، الطلبية ب10 دقائق بتوصلك', sender: 'driver', delay: 1000 },
    { id: 4, text: 'وصلتك الطلبية', sender: 'driver', delay: 1500 },
    { id: 5, text: 'شكراً 😍❤️', sender: 'user', delay: 2000 },
];

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
    const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < messages.length) {
            const message = messages[currentIndex];
            const timer = setTimeout(() => {
                setVisibleMessages((prev) => [...prev, message]);
                setCurrentIndex((prev) => prev + 1);
            }, message.delay);

            return () => clearTimeout(timer);
        }
    }, [currentIndex]);

    const getMessageStyle = (sender: string) => {
        if (sender === 'user') {
            return 'bg-primary-600 self-end';
        } else if (sender === 'support') {
            return 'bg-gray-200 self-start';
        } else {
            return 'bg-success-500 self-start';
        }
    };

    const getMessageTextStyle = (sender: string) => {
        if (sender === 'user') {
            return 'text-white';
        } else {
            return 'text-gray-900';
        }
    };

    const getIcon = (sender: string) => {
        if (sender === 'user') {
            return (
                <View className="bg-white/30 rounded-full p-2 items-center justify-center shadow-sm">
                    <Ionicons name="person-circle-outline" size={28} color="white" />
                </View>
            );
        } else if (sender === 'support') {
            return (
                <View className="bg-white rounded-full p-2 items-center justify-center shadow-md border-2 border-primary-200">
                    <View className="bg-primary-600 rounded-full p-1.5">
                        <Ionicons name="headset" size={22} color="white" />
                    </View>
                </View>
            );
        } else {
            return (
                <View className="bg-white/30 rounded-full p-2 items-center justify-center shadow-sm">
                    <Ionicons name="bicycle-outline" size={28} color="white" />
                </View>
            );
        }
    };

    return (
        <View className="flex-1 bg-white px-6 py-12">
            <View className="flex-1 justify-center">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                    طلبك الأول
                </Text>
                <Text className="text-gray-600 text-center mb-12 text-base">
                    شوف كيف بسيط وسريع
                </Text>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="gap-4">
                        {visibleMessages.map((message, index) => (
                            <View
                                key={message.id}
                                className={`flex-row ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <Animated.View
                                    entering={FadeIn.duration(400)}
                                    className={`flex-row items-start gap-2 px-4 py-3 rounded-2xl max-w-[80%] ${getMessageStyle(message.sender)}`}
                                >
                                    {message.sender !== 'user' && (
                                        <View className="mt-1">
                                            {getIcon(message.sender)}
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <Text className={`text-base ${getMessageTextStyle(message.sender)}`}>
                                            {message.text}
                                        </Text>
                                    </View>
                                    {message.sender === 'user' && (
                                        <View className="mt-1">
                                            {getIcon(message.sender)}
                                        </View>
                                    )}
                                </Animated.View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <TouchableOpacity onPress={onNext}>
                <View className="bg-primary-600 rounded-lg p-4">
                    <Text className="text-white text-center text-base">التالي</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

