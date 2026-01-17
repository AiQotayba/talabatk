import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { FeaturedOrder } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Toast } from '@/utils/toast';

const updateFeaturedOrderSchema = z.object({
  context: z.string().min(10, 'يرجى كتابة وصف مفصل (10 أحرف على الأقل) لمساعدة العملاء على فهم العرض'),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().default(true),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: 'يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء. يرجى اختيار تاريخ صحيح',
  path: ['end_date'],
});

type UpdateFeaturedOrderFormData = z.infer<typeof updateFeaturedOrderSchema>;

export default function EditFeaturedOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { data: featuredOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['admin-featured-order', id],
    queryFn: async () => {
      const response = await apiClient.get<FeaturedOrder[]>('/admin/featured-order');
      const orders = response.data as any;
      return Array.isArray(orders) ? orders.find((o: FeaturedOrder) => o.id === id) : orders;
    },
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateFeaturedOrderFormData>({
    resolver: zodResolver(updateFeaturedOrderSchema),
  });

  useEffect(() => {
    if (featuredOrder) {
      reset({
        context: featuredOrder.context,
        start_date: featuredOrder.start_date,
        end_date: featuredOrder.end_date,
        is_active: featuredOrder.is_active,
      });
    }
  }, [featuredOrder, reset]);

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const isActive = watch('is_active');

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFeaturedOrderFormData) => {
      const response = await apiClient.put(`/admin/featured-order/${id}`, {
        context: data.context,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-featured-order', id] });
      queryClient.invalidateQueries({ queryKey: ['featured-orders'] });
      Toast.success('تم التحديث بنجاح', 'تم تحديث الطلب المميز بنجاح! سيظهر التحديث للعملاء فوراً');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء تحديث الطلب المميز. يرجى التحقق من البيانات والمحاولة مرة أخرى');
    },
  });

  const onSubmit = (data: UpdateFeaturedOrderFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoadingOrder) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <ActivityIndicator size="large" color="#E02020" />
        <Text className="text-gray-500 mt-4 text-start">جاري تحميل بيانات الطلب المميز...</Text>
      </View>
    );
  }

  if (!featuredOrder) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text className="text-gray-500 mt-4 text-start">الطلب المميز غير موجود</Text>
        <Text className="text-gray-400 text-sm mt-2 text-start">يرجى العودة والتحقق من الطلب المطلوب</Text>
        <TouchableOpacity
          className="mt-6 bg-primary-600 rounded-xl py-3 px-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="تعديل الطلب المميز" description="قم بتحديث معلومات الطلب المميز. سيظهر التعديل للعملاء فوراً بعد الحفظ" />

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
            <Controller
              control={control}
              name="start_date"
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
                    onPress={() => setShowStartDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base text-gray-900">
                      {value ? new Date(value).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'اختر التاريخ'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                          onChange(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                </>
              )}
            />
          </View>
        </Animated.View>

        {/* End Date */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">تاريخ الانتهاء</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">متى سينتهي عرض هذا الطلب المميز؟ يجب أن يكون بعد تاريخ البدء</Text>
            <Controller
              control={control}
              name="end_date"
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base text-gray-900">
                      {value ? new Date(value).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'اختر التاريخ'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) {
                          onChange(selectedDate.toISOString());
                        }
                      }}
                    />
                  )}
                </>
              )}
            />
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
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-lg">جاري التحديث...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                <Text className="text-white font-bold text-lg">حفظ التغييرات</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


