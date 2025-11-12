import { useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useToast } from '@/contexts/ToastContext';
import Header from '@/components/ui/header';

interface ProfileFormData {
    name: string;
    phone: string;
}

export default function DriverEditProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAppSelector((state) => state.auth);
    const { showSuccess, showError } = useToast();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['driver-profile'],
        queryFn: async () => {
            const response = await apiClient.get('/users/profile');
            return response.data;
        },
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        },
    });

    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name || user?.name || '',
                phone: profile.phone || user?.phone || '',
            });
        }
    }, [profile, reset, user]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            const response = await apiClient.put('/users/profile', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
            showSuccess('تم تحديث الملف الشخصي بنجاح');
            router.back();
        },
        onError: (error: any) => {
            showError(error.message || 'فشل تحديث الملف الشخصي');
        },
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#E02020" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 mt-8" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
            <Header title="تعديل الملف الشخصي" />

            <View className="px-6 py-4">
                <Animated.View entering={FadeInDown.duration(600)}>
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">الاسم</Text>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: 'الاسم مطلوب' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                                    placeholder="أدخل الاسم"
                                    placeholderTextColor="#9ca3af"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    style={{ textAlign: "right" }}
                                />
                            )}
                        />
                        {errors.name && (
                            <Text className="text-red-500 text-sm mt-2 text-start">{errors.name.message}</Text>
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">رقم الهاتف</Text>
                        <Controller
                            control={control}
                            name="phone"
                            rules={{ required: 'رقم الهاتف مطلوب' }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white text-start"
                                    placeholder="أدخل رقم الهاتف"
                                    placeholderTextColor="#9ca3af"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    keyboardType="phone-pad"
                                    style={{ textAlign: "right" }}
                                />
                            )}
                        />
                        {errors.phone && (
                            <Text className="text-red-500 text-sm mt-2 text-start">{errors.phone.message}</Text>
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <TouchableOpacity
                        className="bg-primary-600 rounded-xl py-4"
                        onPress={handleSubmit((data) => updateProfileMutation.mutate(data))}
                        disabled={updateProfileMutation.isPending}
                        activeOpacity={0.8}
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

