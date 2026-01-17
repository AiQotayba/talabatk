import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/auth.slice';
import { apiClient } from '@/services/api/apiClient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import ImageUploadInput from '@/components/ui/ImageUploadInput';
import { Toast } from '@/utils/toast';

const profileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  profile_photo_url: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profile_photo_url: user?.profile_photo_url || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Update profile with all data including profile_photo_url
      // Only send profile_photo_url if it's a URL (not a local file)
      const updateData: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
      
      // Only include profile_photo_url if it's already uploaded (starts with http)
      if (data.profile_photo_url && !data.profile_photo_url.startsWith('file://')) {
        updateData.profile_photo_url = data.profile_photo_url;
      }
      
      const response = await apiClient.put('/users/profile', updateData);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user in Redux store
      if (data.user) {
        dispatch(updateProfile(data.user));
      }
      Toast.success('تم التحديث بنجاح', 'تم تحديث الملف الشخصي بنجاح!');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('فشل التحديث', error.message || 'حدث خطأ أثناء تحديث الملف الشخصي. يرجى المحاولة مرة أخرى');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="تعديل الملف الشخصي" />

      <View className="px-6 py-8">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
          <ImageUploadInput
            name="profile_photo_url"
            control={control}
            variant="profile"
            folder="profiles"
            helperText="اضغط لتغيير الصورة الشخصية"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">الاسم</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                  placeholder="أدخل الاسم"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.name.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">البريد الإلكتروني</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                  placeholder="أدخل البريد الإلكتروني"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.email.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">رقم الهاتف</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                  placeholder="أدخل رقم الهاتف"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.phone && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.phone.message}</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(250)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={handleSubmit(onSubmit)}
            disabled={updateProfileMutation.isPending}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">حفظ التغييرات</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

