import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from '@/utils/toast';
import { Order } from '@/types/order.types';

const createFeaturedOrderSchema = z.object({
  context: z.string().min(10, 'يرجى كتابة وصف مفصل (10 أحرف على الأقل) لمساعدة العملاء على فهم العرض'),
  start_date: z.date(),
  end_date: z.date(),
  is_active: z.boolean().default(true),
}).refine((data) => data.end_date > data.start_date, {
  message: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء. يرجى اختيار تاريخ صحيح',
  path: ['end_date'],
});

type CreateFeaturedOrderFormData = z.infer<typeof createFeaturedOrderSchema>;

interface CreateFeaturedOrderDialogProps {
  visible: boolean;
  order?: Order | null;
  onClose: () => void;
}

export default function CreateFeaturedOrderDialog({
  visible,
  order,
  onClose,
}: CreateFeaturedOrderDialogProps) {
  const queryClient = useQueryClient();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateFeaturedOrderFormData>({
    resolver: zodResolver(createFeaturedOrderSchema),
    defaultValues: {
      context: order?.content || '',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      is_active: true,
    },
  });

  // Reset form when order changes or dialog opens
  useEffect(() => {
    if (visible && order) {
      reset({
        context: order.content || '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true,
      });
    }
  }, [visible, order, reset]);

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const isActive = watch('is_active');

  const createMutation = useMutation({
    mutationFn: async (data: CreateFeaturedOrderFormData) => {
      const response = await apiClient.post('/admin/featured-order', {
        context: data.context,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        is_active: data.is_active,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-orders'] });
      queryClient.invalidateQueries({ queryKey: ['featured-orders'] });
      Toast.success('تم الإنشاء بنجاح', 'تم إنشاء الطلب المميز بنجاح! سيظهر الآن للعملاء في الصفحة الرئيسية');
      reset();
      onClose();
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء إنشاء الطلب المميز. يرجى المحاولة مرة أخرى');
    },
  });

  const onSubmit = (data: CreateFeaturedOrderFormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
                  إنشاء طلب مميز
                </Text>
                <Text className="text-sm text-gray-500 text-start">
                  {order ? `من الطلب #${order.code_order || order.id?.slice(0, 8)}` : 'أكمل المعلومات التالية'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>


            {/* Context */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">وصف الطلب المميز</Text>
              <Text className="text-xs text-gray-500 mb-3 text-start">اكتب وصفاً واضحاً وجذاباً يوضح مزايا هذا الطلب للعملاء</Text>
              <Controller
                control={control}
                name="context"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white min-h-24"
                    placeholder="مثال: طلب توصيل سريع مع خصم 20% على جميع الطلبات خلال هذا الأسبوع..."
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{ textAlign: 'right' }}
                  />
                )}
              />
              {errors.context && (
                <Text className="text-red-500 text-sm mt-2 text-start">{errors.context.message}</Text>
              )}
            </View>

            {/* Dates */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">فترة العرض</Text>
              <Text className="text-xs text-gray-500 mb-3 text-start">اختر تاريخي البدء والانتهاء لعرض هذا الطلب المميز</Text>
              <View className="flex-row gap-3">
                {/* Start Date */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 mb-2 text-start">تاريخ البدء</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl px-3 py-3 bg-white flex-row items-center justify-between"
                    onPress={() => setShowStartDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                      {startDate.toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                          setValue('start_date', selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                {/* End Date */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 mb-2 text-start">تاريخ الانتهاء</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl px-3 py-3 bg-white flex-row items-center justify-between"
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm text-gray-900 flex-1" numberOfLines={1}>
                      {endDate.toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) {
                          setValue('end_date', selectedDate);
                        }
                      }}
                    />
                  )}
                </View>
              </View>
              {errors.end_date && (
                <Text className="text-red-500 text-sm mt-2 text-start">{errors.end_date.message}</Text>
              )}
            </View>

            {/* Is Active */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">حالة العرض</Text>
              <Text className="text-xs text-gray-500 mb-3 text-start">اختر "نشط" لإظهار الطلب للعملاء فوراً، أو "غير نشط" لإخفائه مؤقتاً</Text>
              <TouchableOpacity
                className={`border-2 rounded-xl px-4 py-4 flex-row items-center justify-between ${isActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                  }`}
                onPress={() => setValue('is_active', !isActive)}
                activeOpacity={0.7}
              >
                <Text className={`text-base font-semibold ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                  {isActive ? 'نشط - سيظهر للعملاء' : 'غير نشط - مخفي عن العملاء'}
                </Text>
                <Ionicons
                  name={isActive ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={isActive ? '#16a34a' : '#6b7280'}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="flex-1 border-2 border-gray-300 rounded-xl py-4"
                onPress={handleClose}
                disabled={createMutation.isPending}
                activeOpacity={0.8}
              >
                <Text className="text-center font-bold text-lg text-gray-700">إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-600 rounded-xl py-4"
                onPress={handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
                activeOpacity={0.8}
              >
                {createMutation.isPending ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold text-lg">جاري الإنشاء...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                    <Text className="text-white font-bold text-lg">إنشاء</Text>
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

