import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { apiClient } from '@/services/api/apiClient';
import { Address } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const addressSchema = z.object({
  city: z.string().min(2, 'المدينة مطلوبة'),
  street: z.string().min(5, 'عنوان الشارع يجب أن يكون على الأقل 5 أحرف'),
  label: z.string().optional(),
  notes: z.string().optional(),
  is_default: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: address, isLoading: addressLoading } = useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const response = await apiClient.get<Address>(`/users/addresses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (address) {
      reset({
        city: address.city,
        street: address.street,
        label: address.label || '',
        notes: address.notes || '',
        is_default: address.is_default,
      });
    }
  }, [address, reset]);

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiClient.put(`/users/addresses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('نجح', 'تم تحديث العنوان بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل تحديث العنوان');
    },
  });

  const onSubmit = (data: AddressFormData) => {
    updateAddressMutation.mutate(data);
  };

  if (addressLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }

  if (!address) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <Text className="text-gray-500 text-right">العنوان غير موجود</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-right">تعديل العنوان</Text>
      </View>

      <View className="px-6 py-4">
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-right">الاسم (اختياري)</Text>
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-right"
                  placeholder="مثال: المنزل، العمل"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ textAlign: 'right' }}
                />
              )}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-right">عنوان الشارع</Text>
            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-right"
                  placeholder="أدخل عنوان الشارع"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.street && (
              <Text className="text-red-500 text-sm mt-2 text-right">{errors.street.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-right">المدينة</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-right"
                  placeholder="أدخل المدينة"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.city && (
              <Text className="text-red-500 text-sm mt-2 text-right">{errors.city.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-right">ملاحظات (اختياري)</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-right"
                  placeholder="تعليمات إضافية للتوصيل"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <View className="mb-6">
            <Controller
              control={control}
              name="is_default"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => onChange(!value)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row-reverse' }}
                >
                  <View
                    className={`w-6 h-6 border-2 rounded-lg ml-3 items-center justify-center ${
                      value ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                    }`}
                  >
                    {value && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text className="text-gray-700 text-base text-right">تعيين كعنوان افتراضي</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(350)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={handleSubmit(onSubmit)}
            disabled={updateAddressMutation.isPending}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {updateAddressMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                تحديث العنوان
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


