import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RatingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { score: number; comment?: string }) => {
      const response = await apiClient.post('/ratings', {
        order_id: id,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      Alert.alert('شكراً لك', 'تم إرسال تقييمك بنجاح!');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إرسال التقييم');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('التقييم مطلوب', 'الرجاء اختيار تقييم');
      return;
    }
    submitRatingMutation.mutate({ score: rating, comment: comment.trim() || undefined });
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="px-6 py-8">
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="items-center mb-8">
            <View className="bg-primary-100 rounded-full p-4 w-20 h-20 items-center justify-center mb-4">
              <Ionicons name="star" size={40} color="#E02020" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">قيم طلبك</Text>
            <Text className="text-gray-600 text-base text-center">كيف كانت تجربتك مع التوصيل؟</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-8">
            {/* <Text className="text-base font-semibold text-gray-900 mb-6 text-center">التقييم</Text> */}
            <View className="flex-row justify-center gap-3" >
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    entering={FadeInDown.duration(300).delay(star * 50)}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={52}
                      color={star <= rating ? '#fbbf24' : '#d1d5db'}
                    />
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">تعليق (اختياري)</Text>
            <TextInput
              className="border-2 border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50"
              placeholder="اكتب عن تجربتك..."
              placeholderTextColor="#9ca3af"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
              style={{ textAlign: 'right' }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={handleSubmit}
            disabled={submitRatingMutation.isPending || rating === 0}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity: rating === 0 ? 0.5 : 1,
            }}
          >
            {submitRatingMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center gap-2" >
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text className="text-white text-center font-bold text-base">
                  إرسال التقييم
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


