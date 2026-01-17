import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from '@/utils/toast';

const createBannerSchema = z.object({
  title: z.string().max(200, 'العنوان يجب أن يكون أقل من 200 حرف').optional(),
  image_url: z.string().url('يرجى إدخال رابط صورة صحيح. يمكنك رفع صورة أو إدخال رابط مباشر'),
  link: z.string().url('يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://').optional().or(z.literal('')),
  order_index: z.number().int().min(0, 'الترتيب يجب أن يكون رقم موجب أو صفر').default(0),
  is_active: z.boolean().default(true),
});

type CreateBannerFormData = z.infer<typeof createBannerSchema>;

export default function CreateBannerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateBannerFormData>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: {
      title: '',
      image_url: '',
      link: '',
      order_index: 0,
      is_active: true,
    },
  });

  const imageUrl = watch('image_url');
  const isActive = watch('is_active');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.warning('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى معرض الصور. يرجى تفعيل الإذن من إعدادات التطبيق');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Upload image and set URL
      await uploadImage(imageUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.warning('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى الكاميرا. يرجى تفعيل الإذن من إعدادات التطبيق');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      await uploadImage(imageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_photo', {
        uri: uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'banner.jpg',
      } as any);

      const response = await apiClient.uploadFile<{ url: string }>('/users/profile-photo', formData);
      const uploadedUrl = (response as any).data?.profile_photo_url || (response as any).data?.url;
      if (uploadedUrl) {
        setValue('image_url', uploadedUrl);
        Toast.success('تم الرفع بنجاح', 'تم رفع الصورة بنجاح');
      } else {
        Toast.error('فشل الرفع', 'فشل رفع الصورة. يرجى المحاولة مرة أخرى أو استخدام رابط مباشر');
      }
    } catch (error: any) {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى أو استخدام رابط مباشر');
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateBannerFormData) => {
      const response = await apiClient.post('/admin/banner', {
        title: data.title || undefined,
        image_url: data.image_url,
        link: data.link || undefined,
        order_index: data.order_index,
        is_active: data.is_active,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      Toast.success('تم الإنشاء بنجاح', 'تم إنشاء البانر بنجاح! سيظهر الآن للعملاء في الصفحة الرئيسية');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء إنشاء البانر. يرجى التحقق من البيانات والمحاولة مرة أخرى');
    },
  });

  const onSubmit = (data: CreateBannerFormData) => {
    createMutation.mutate(data);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="إنشاء بانر جديد" description="أكمل المعلومات التالية لإنشاء بانر سيظهر للعملاء في الصفحة الرئيسية" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        {/* Image Upload */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">صورة البانر</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">اختر صورة جذابة للبانر. النسبة المثالية 16:9</Text>
            {(selectedImage || imageUrl) && (
              <View className="mb-3 rounded-lg overflow-hidden" style={{ height: 200 }}>
                <Image
                  source={{ uri: selectedImage || imageUrl }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              </View>
            )}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-primary-100 rounded-xl py-3"
                onPress={pickImage}
                activeOpacity={0.7}
                disabled={isUploading}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="image" size={20} color="#E02020" />
                  <Text className="text-primary-700 font-semibold">اختر صورة</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3"
                onPress={takePhoto}
                activeOpacity={0.7}
                disabled={isUploading}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="camera" size={20} color="#6b7280" />
                  <Text className="text-gray-700 font-semibold">التقط صورة</Text>
                </View>
              </TouchableOpacity>
            </View>
            {isUploading && (
              <View className="mt-2 items-center">
                <ActivityIndicator size="small" color="#E02020" />
                <Text className="text-gray-500 text-sm mt-1 text-start">جاري رفع الصورة... يرجى الانتظار</Text>
              </View>
            )}
            <Controller
              control={control}
              name="image_url"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    className="mt-3 border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                    placeholder="أو أدخل رابط الصورة مباشرة (يجب أن يبدأ بـ http:// أو https://)"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    style={{ textAlign: 'right' }}
                  />
                  {errors.image_url && (
                    <Text className="text-red-500 text-sm mt-2 text-start">
                      {errors.image_url.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">عنوان البانر (اختياري)</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">أضف عنواناً وصفياً للبانر (حد أقصى 200 حرف)</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholder="مثال: عرض خاص على التوصيل السريع..."
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={200}
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.title && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.title.message}</Text>
            )}
          </View>
        </Animated.View>

        {/* Link */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">رابط البانر (اختياري)</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">أدخل رابطاً سيتم فتحه عند الضغط على البانر (يجب أن يبدأ بـ http:// أو https://)</Text>
            <Controller
              control={control}
              name="link"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholder="مثال: https://example.com/page"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="url"
                  autoCapitalize="none"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.link && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.link.message}</Text>
            )}
          </View>
        </Animated.View>

        {/* Order Index */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">ترتيب العرض</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">حدد ترتيب ظهور البانر. الأرقام الأصغر تظهر أولاً (0 = الأول)</Text>
            <Controller
              control={control}
              name="order_index"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    onChange(num);
                  }}
                  keyboardType="number-pad"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.order_index && (
              <Text className="text-red-500 text-sm mt-2 text-start">
                {errors.order_index.message}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Is Active */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">حالة البانر</Text>
            <Text className="text-xs text-gray-500 mb-3 text-start">اختر "نشط" لإظهار البانر للعملاء فوراً، أو "غير نشط" لإخفائه مؤقتاً</Text>
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
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
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
                <Text className="text-white font-bold text-lg">إنشاء البانر</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


