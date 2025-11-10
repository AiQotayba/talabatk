import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { apiClient } from '@/services/api/apiClient';
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

export default function AddAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData & { lat: number; lng: number }) => {
      const response = await apiClient.post('/users/addresses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('نجح', 'تم إضافة العنوان بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إضافة العنوان');
    },
  });

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('طلب مرفوض', 'يجب منح إذن الموقع');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        setValue('street', `${address.street || ''} ${address.streetNumber || ''}`.trim());
        setValue('city', address.city || '');
      }

      // Store coordinates for submission
      setValue('lat' as any, latitude);
      setValue('lng' as any, longitude);
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل الحصول على الموقع');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    // Get location if not set
    let lat = watch('lat' as any);
    let lng = watch('lng' as any);

    if (!lat || !lng) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('خطأ', 'يجب منح إذن الموقع');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } catch (error: any) {
        Alert.alert('خطأ', 'الرجاء تفعيل خدمات الموقع');
        return;
      }
    }

    createAddressMutation.mutate({ ...data, lat, lng });
  };

  return (
    <ScrollView className="flex-1 my-10 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-start">إضافة عنوان جديد</Text>
      </View>

      <View className="px-6 py-4">
        <Animated.View entering={FadeInDown.duration(600)}>
          <TouchableOpacity
            className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mb-6 flex-row items-center"
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
            activeOpacity={0.7}
            style={{ flexDirection: 'row' }}
          >
            <Ionicons name="location" size={24} color="#E02020" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900 text-start">استخدام الموقع الحالي</Text>
              <Text className="text-gray-600 text-sm text-start mt-1">
                {isGettingLocation ? 'جاري الحصول على الموقع...' : 'الحصول على موقعك تلقائياً'}
              </Text>
            </View>
            {isGettingLocation && <ActivityIndicator color="#E02020" />}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">الاسم (اختياري)</Text>
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
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

        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">عنوان الشارع</Text>
            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
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
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.street.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">المدينة</Text>
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
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.city.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">ملاحظات (اختياري)</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
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
                  style={{ flexDirection: 'row' }}
                >
                  <View
                    className={`w-6 h-6 border-2 rounded-lg mr-3 items-center justify-center ${
                      value ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                    }`}
                  >
                    {value && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text className="text-gray-700 text-base text-start">تعيين كعنوان افتراضي</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(350)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={handleSubmit(onSubmit)}
            disabled={createAddressMutation.isPending}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {createAddressMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                حفظ العنوان
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


