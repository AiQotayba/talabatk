import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Toast } from '@/utils/toast';
import { Order } from '@/types/order.types';

interface UpdateOrderContentDialogProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function UpdateOrderContentDialog({
  visible,
  order,
  onClose,
}: UpdateOrderContentDialogProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  // Reset content when dialog opens or order changes
  useEffect(() => {
    if (visible && order) {
      setContent(order.content || '');
    }
  }, [visible, order]);

  const updateContentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!order?.id) throw new Error('Order ID is required');
      const response = await apiClient.put(`/orders/${order.id}/content`, { content });
      return response.data;
    },
    onSuccess: () => {
      if (order?.id) {
        queryClient.invalidateQueries({ queryKey: ['order', order.id] });
        queryClient.invalidateQueries({ queryKey: ['messages', order.id] });
      }
      Toast.success('تم التحديث بنجاح', 'تم تحديث محتوى الطلب بنجاح! سيتم إشعار العميل بالتغيير');
      setContent('');
      onClose();
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

  const handleClose = () => {
    setContent('');
    onClose();
  };

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-4" style={{ direction: 'rtl' }}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90%]"
          style={{ direction: 'rtl' }}
        >
          <ScrollView showsVerticalScrollIndicator={false} className="p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 text-start mb-1">
                  تحديث محتوى الطلب
                </Text>
                <Text className="text-sm text-gray-500 text-start">
                  الطلب #{order.code_order || order.id?.slice(0, 8)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View> 

            {/* Content Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">محتوى الطلب الجديد</Text>
              <Text className="text-xs text-gray-500 mb-3 text-start">
                قم بتعديل محتوى الطلب. سيتم إشعار العميل بأي تغيير
              </Text>
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

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="flex-1 border-2 border-gray-300 rounded-xl py-4"
                onPress={handleClose}
                disabled={updateContentMutation.isPending}
                activeOpacity={0.8}
              >
                <Text className="text-center font-bold text-lg text-gray-700">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-600 rounded-xl py-4"
                onPress={handleUpdate}
                disabled={!content.trim() || updateContentMutation.isPending}
                activeOpacity={0.8}
              >
                {updateContentMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold text-lg">جاري التحديث...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                    <Text className="text-white font-bold text-lg">تحديث</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

