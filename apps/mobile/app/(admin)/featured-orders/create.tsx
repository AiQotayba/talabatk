import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from '@/utils/toast';

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

export default function CreateFeaturedOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const queryClient = useQueryClient();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateFeaturedOrderFormData>({
    resolver: zodResolver(createFeaturedOrderSchema),
    defaultValues: {
      context: '',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      is_active: true,
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const isActive = watch('is_active');

  const createMutation = useMutation({
    mutationFn: async (data: CreateFeaturedOrderFormData) => {
      const response = await apiClient.post('/admin/featured-order', {
        order_id: params.orderId || undefined,
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
      router.back();
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء إنشاء الطلب المميز. يرجى المحاولة مرة أخرى');
    },
  });

  const onSubmit = (data: CreateFeaturedOrderFormData) => {
    createMutation.mutate(data);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 my-8"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="إنشاء طلب مميز" description="أكمل المعلومات التالية لإنشاء طلب مميز سيظهر للعملاء في الصفحة الرئيسية" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        {/* Context */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="mb-6">
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
        </Animated.View>

        {/* Start Date */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">تاريخ البدء</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">متى سيبدأ عرض هذا الطلب المميز للعملاء؟</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
              onPress={() => setShowStartDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-base text-gray-900">
                {startDate.toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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
        </Animated.View>

        {/* End Date */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">تاريخ الانتهاء</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">متى سينتهي عرض هذا الطلب المميز؟ يجب أن يكون بعد تاريخ البدء</Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
              onPress={() => setShowEndDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-base text-gray-900">
                {endDate.toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
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
            {errors.end_date && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.end_date.message}</Text>
            )}
          </View>
        </Animated.View>

        {/* Is Active */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">حالة العرض</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">اختر "نشط" لإظهار الطلب للعملاء فوراً، أو "غير نشط" لإخفائه مؤقتاً</Text>
            <TouchableOpacity
              className={`border-2 rounded-xl px-4 py-4 flex-row items-center justify-between ${
                isActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
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
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4 mb-6"
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
                <Text className="text-white font-bold text-lg">إنشاء الطلب المميز</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

