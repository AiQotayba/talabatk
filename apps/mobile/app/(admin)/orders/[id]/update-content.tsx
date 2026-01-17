import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';

export default function UpdateOrderContentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const updateContentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiClient.put(`/orders/${id}/content`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      Toast.success('تم التحديث بنجاح', 'تم تحديث محتوى الطلب بنجاح! سيتم إشعار العميل بالتغيير');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('فشل التحديث', error.message || 'حدث خطأ أثناء تحديث المحتوى. يرجى المحاولة مرة أخرى');
    },
  });

  const handleUpdate = () => {
    if (!content.trim() || content.trim().length < 5) {
      Toast.error('محتوى غير صحيح', 'المحتوى يجب أن يكون على الأقل 5 أحرف');
      return;
    }
    updateContentMutation.mutate(content.trim());
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="تحديث محتوى الطلب" description="قم بتعديل محتوى الطلب. سيتم إشعار العميل بأي تغيير" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">محتوى الطلب</Text>
          <TextInput
            className="bg-white border-2 border-gray-200 rounded-xl p-4 text-base min-h-[200px]"
            placeholder="اكتب وصفاً واضحاً للطلب..."
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            maxLength={1000}
            textAlignVertical="top"
            style={{ textAlign: 'right' }}
          />
          <Text className="text-xs text-gray-500 mt-2 text-start">
            {content.length}/1000
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 mb-6"
          onPress={handleUpdate}
          disabled={!content.trim() || updateContentMutation.isPending}
          activeOpacity={0.8}
        >
          {updateContentMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text className="text-white font-bold text-lg">تحديث المحتوى</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


