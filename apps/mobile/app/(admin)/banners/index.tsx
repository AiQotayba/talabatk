import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

interface Banner {
  id: string;
  title?: string;
  image_url: string;
  link?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BannersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showDialog, DialogComponent } = useConfirmDialog();

  const { data: banners, isLoading, refetch } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const response = await apiClient.get<Banner[]>('/admin/banner');
      return response.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      await apiClient.delete(`/admin/banner/${bannerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      Toast.success('تم الحذف بنجاح', 'تم حذف البانر بنجاح. لن يظهر للعملاء بعد الآن');
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء حذف البانر. يرجى المحاولة مرة أخرى');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await apiClient.put(`/admin/banner/${id}`, { is_active });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      Toast.success(
        'تم التحديث بنجاح',
        variables.is_active
          ? 'تم تفعيل البانر بنجاح! سيظهر الآن للعملاء'
          : 'تم إخفاء البانر بنجاح. لن يظهر للعملاء بعد الآن'
      );
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء تحديث حالة البانر. يرجى المحاولة مرة أخرى');
    },
  });

  const handleDelete = (bannerId: string) => {
    showDialog({
      title: 'حذف البانر',
      message: 'هل أنت متأكد من حذف هذا البانر؟ لن تتمكن من استرجاعه بعد الحذف',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: () => deleteMutation.mutate(bannerId),
    });
  };

  const handleToggleActive = (banner: Banner) => {
    toggleActiveMutation.mutate({ id: banner.id, is_active: !banner.is_active });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <Header
        title="إدارة البانرات"
        description="قم بإدارة البانرات المعروضة للعملاء في الصفحة الرئيسية. يمكنك إضافة، تعديل، تفعيل أو إخفاء البانرات"
      />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 mb-6"
          onPress={() => router.push('/(admin)/banners/create')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="add-circle" size={24} color="#ffffff" />
            <Text className="text-white font-bold text-lg">إنشاء بانر جديد</Text>
          </View>
        </TouchableOpacity>

        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4 text-start">جاري تحميل البانرات...</Text>
          </View>
        ) : banners && banners.length > 0 ? (
          banners.map((banner, index) => (
            <Animated.View
              key={banner.id}
              entering={FadeInDown.duration(400).delay(index * 50)}
              className="mb-4"
            >
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    {banner.title && (
                      <Text className="font-bold text-gray-900 text-lg mb-2 text-start">
                        {banner.title}
                      </Text>
                    )}
                    <View className="flex-row items-center gap-2 mb-2">
                      <View
                        className={`px-3 py-1 rounded-full ${
                          banner.is_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            banner.is_active ? 'text-green-700' : 'text-gray-600'
                          }`}
                        >
                          {banner.is_active ? 'نشط - يظهر للعملاء' : 'غير نشط - مخفي'}
                        </Text>
                      </View>
                      <View className="bg-primary-100 px-3 py-1 rounded-full">
                        <Text className="text-primary-700 text-xs font-semibold">
                          الترتيب: {banner.order_index}
                        </Text>
                      </View>
                    </View>
                    {banner.link && (
                      <Text className="text-gray-600 text-sm mb-2 text-start" numberOfLines={1}>
                        رابط: {banner.link}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="mb-3 rounded-lg overflow-hidden" style={{ height: 150 }}>
                  <Image
                    source={{ uri: banner.image_url }}
                    className="w-full h-full"
                    style={{ resizeMode: 'cover' }}
                  />
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-primary-100 rounded-lg py-3"
                    onPress={() => router.push(`/(admin)/banners/${banner.id}/edit`)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Ionicons name="pencil" size={18} color="#E02020" />
                      <Text className="text-primary-700 font-semibold text-sm">تعديل</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 rounded-lg py-3 ${
                      banner.is_active ? 'bg-orange-100' : 'bg-green-100'
                    }`}
                    onPress={() => handleToggleActive(banner)}
                    activeOpacity={0.7}
                    disabled={toggleActiveMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center gap-2">
                      <Ionicons
                        name={banner.is_active ? 'eye-off' : 'eye'}
                        size={18}
                        color={banner.is_active ? '#d97706' : '#16a34a'}
                      />
                      <Text
                        className={`font-semibold text-sm ${
                          banner.is_active ? 'text-orange-700' : 'text-green-700'
                        }`}
                      >
                        {banner.is_active ? 'إخفاء' : 'تفعيل'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-100 rounded-lg py-3 px-4"
                    onPress={() => handleDelete(banner.id)}
                    activeOpacity={0.7}
                    disabled={deleteMutation.isPending}
                  >
                    <Ionicons name="trash" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-16 items-center">
            <Ionicons name="images-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 mb-2 text-start">
              لا توجد بانرات حالياً
            </Text>
            <Text className="text-gray-400 text-sm mb-6 text-start">
              ابدأ بإنشاء بانر جديد ليظهر للعملاء في الصفحة الرئيسية
            </Text>
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-3 px-6"
              onPress={() => router.push('/(admin)/banners/create')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">إنشاء أول بانر</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      <DialogComponent />
    </ScrollView>
  );
}

