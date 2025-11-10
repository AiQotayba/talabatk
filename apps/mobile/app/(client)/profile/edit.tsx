import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/auth.slice';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const profileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profile_photo_url || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user in Redux store
      if (data.user) {
        dispatch(updateProfile(data.user));
      }
      Alert.alert('نجح', 'تم تحديث الملف الشخصي بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل تحديث الملف الشخصي');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profile_photo', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await apiClient.uploadFile('/users/profile-photo', formData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        dispatch(updateProfile(data.user));
        setProfilePhoto(data.user.profile_photo_url || null);
      }
      Alert.alert('نجح', 'تم تحديث الصورة الشخصية بنجاح');
      setIsUploadingPhoto(false);
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل رفع الصورة');
      setIsUploadingPhoto(false);
    },
  });

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('طلب مرفوض', 'يجب منح إذن الوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingPhoto(true);
        uploadPhotoMutation.mutate(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل اختيار الصورة');
      setIsUploadingPhoto(false);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-start">تعديل الملف الشخصي</Text>
      </View>

      <View className="px-6 py-8">
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUploadingPhoto}
            activeOpacity={0.7}
            className="relative"
          >
            <View
              className="w-32 h-32 bg-primary-100 rounded-full items-center justify-center"
              style={{
                shadowColor: '#E02020',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  className="w-32 h-32 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={64} color="#E02020" />
              )}
              {isUploadingPhoto && (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
            <View
              className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2"
              style={{
                shadowColor: '#E02020',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-600 text-sm mt-4 text-center">اضغط لتغيير الصورة الشخصية</Text>
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
            disabled={updateProfileMutation.isPending || isUploadingPhoto}
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

