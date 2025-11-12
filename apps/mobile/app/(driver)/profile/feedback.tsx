import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useToast } from '@/contexts/ToastContext';
import Header from '@/components/ui/header';

export default function DriverFeedbackScreen() {
    const router = useRouter();
    const [feedback, setFeedback] = useState('');
    const { showSuccess, showError, showWarning } = useToast();

    const submitFeedbackMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await apiClient.post('/feedback', { content });
            return response.data;
        },
        onSuccess: () => {
            showSuccess('تم إرسال الملاحظات بنجاح');
            router.back();
        },
        onError: (error: any) => {
            showError(error.message || 'فشل إرسال الملاحظات');
        },
    });

    return (
        <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
            <Header title="إرسال ملاحظات" />

            <View className="px-6 py-4">
                <Animated.View entering={FadeInDown.duration(600)}>
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">الملاحظات</Text>
                        <TextInput
                            className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                            placeholder="اكتب ملاحظاتك هنا..."
                            placeholderTextColor="#9ca3af"
                            value={feedback}
                            onChangeText={setFeedback}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            style={{ textAlign: 'right', minHeight: 200 }}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <TouchableOpacity
                        className="bg-primary-600 rounded-xl py-4"
                        onPress={() => {
                            if (feedback.trim()) {
                                submitFeedbackMutation.mutate(feedback.trim());
                            } else {
                                showWarning('الرجاء إدخال الملاحظات');
                            }
                        }}
                        disabled={submitFeedbackMutation.isPending}
                        activeOpacity={0.8}
                    >
                        {submitFeedbackMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-base">إرسال الملاحظات</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </ScrollView>
    );
}

