import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { updateProfile } from '@/store/slices/auth.slice';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Logout from '@/components/atoms/logout';
import { Toast } from '@/utils/toast';

export default function DriverProfileScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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
            }
            Toast.success('تم التحديث بنجاح', 'تم تحديث الصورة الشخصية بنجاح!');
            setIsUploadingPhoto(false);
        },
        onError: (error: any) => {
            Toast.error('فشل الرفع', error.message || 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى');
            setIsUploadingPhoto(false);
        },
    });

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.error('إذن مطلوب', 'يجب منح إذن الوصول إلى الصور لتتمكن من تغيير الصورة الشخصية');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                // @ts-ignore - MediaTypeOptions is deprecated but still works in this version
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
            Toast.error('فشل الاختيار', error.message || 'حدث خطأ أثناء اختيار الصورة. يرجى المحاولة مرة أخرى');
            setIsUploadingPhoto(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
            <View className="bg-white px-6 py-8" style={{ direction: 'rtl' }}>
                <Animated.View entering={FadeInDown.duration(600)} className="items-center">
                    <TouchableOpacity
                        onPress={pickImage}
                        disabled={isUploadingPhoto}
                        activeOpacity={0.8}
                        className="relative"
                    >
                        <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4 overflow-hidden">
                            {isUploadingPhoto ? (
                                <ActivityIndicator size="large" color="#E02020" />
                            ) : user?.profile_photo_url ? (
                                <Image
                                    source={{ uri: user.profile_photo_url }}
                                    className="w-24 h-24 rounded-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="person" size={48} color="#E02020" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 border-2 border-white">
                            <Ionicons name="camera" size={16} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-900 text-right mb-1">{user?.name}</Text>
                    <Text className="text-gray-600 text-base text-right">{user?.phone}</Text>
                    {user?.email && (
                        <Text className="text-gray-600 text-base text-right">{user.email}</Text>
                    )}
                </Animated.View>
            </View>

            <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <TouchableOpacity
                        className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => router.push('/(driver)/profile/edit')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="person-outline" size={24} color="#E02020" />
                            <Text className="text-gray-900 font-semibold text-base text-right">تعديل الملف الشخصي</Text>
                        </View>
                        <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(150)}>
                    <TouchableOpacity
                        className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
                        onPress={() => router.push('/(driver)/profile/feedback')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="chatbubble-outline" size={24} color="#E02020" />
                            <Text className="text-gray-900 font-semibold text-base text-right">إرسال ملاحظات</Text>
                        </View>
                        <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </Animated.View>
                <Logout />
            </View>
        </ScrollView>
    );
}

