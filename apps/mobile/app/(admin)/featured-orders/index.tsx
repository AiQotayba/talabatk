import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { FeaturedOrder } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import CreateFeaturedOrderDialog from '@/components/admin/CreateFeaturedOrderDialog';

export default function AdminFeaturedOrdersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showDialog, DialogComponent } = useConfirmDialog();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: featuredOrders, isLoading, refetch } = useQuery({
    queryKey: ['admin-featured-orders'],
    queryFn: async () => {
      const response = await apiClient.get<FeaturedOrder[]>('/admin/featured-order');
      return response.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/featured-order/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-orders'] });
      queryClient.invalidateQueries({ queryKey: ['featured-orders'] });
      Toast.success('تم الحذف بنجاح', 'تم حذف الطلب المميز بنجاح. لن يظهر للعملاء بعد الآن');
    },
    onError: (error: any) => {
      Toast.error('حدث خطأ', error.message || 'حدث خطأ أثناء حذف الطلب المميز. يرجى المحاولة مرة أخرى');
    },
  });

  const handleDelete = (id: string) => {
    showDialog({
      title: 'حذف الطلب المميز',
      message: 'هل أنت متأكد من حذف هذا الطلب المميز؟ لن تتمكن من استرجاعه بعد الحذف',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mt-8"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="الطلبات المميزة" description="قم بإدارة الطلبات المميزة المعروضة للعملاء. يمكنك إضافة، تعديل أو حذف الطلبات المميزة" />

      <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 px-6 mb-6 flex-row items-center justify-center gap-3"
          onPress={() => setShowCreateDialog(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color="#ffffff" />
          <Text className="text-white font-bold text-lg">إنشاء طلب مميز جديد</Text>
        </TouchableOpacity>
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4 text-start">جاري تحميل الطلبات المميزة...</Text>
          </View>
        ) : featuredOrders && featuredOrders.length > 0 ? (
          featuredOrders.map((order, index) => (
            <Animated.View
              key={order.id}
              entering={FadeInDown.duration(300).delay(index * 50)}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-2" numberOfLines={2}>
                    {order.context}
                  </Text>
                  <View className="flex-row items-center gap-4 mb-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500">
                        {new Date(order.start_date).toLocaleDateString('ar-SA')} - {new Date(order.end_date).toLocaleDateString('ar-SA')}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-3 py-1 rounded-full ${order.is_active ? 'bg-green-100' : 'bg-gray-100'}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${order.is_active ? 'text-green-700' : 'text-gray-700'}`}
                      >
                        {order.is_active ? 'نشط - يظهر للعملاء' : 'غير نشط - مخفي'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center gap-3 mt-3">
                <TouchableOpacity
                  className="flex-1 bg-primary-600 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2"
                  onPress={() => router.push(`/(admin)/featured-orders/${order.id}/edit` as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={18} color="#ffffff" />
                  <Text className="text-white font-semibold text-sm">تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-red-600 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2"
                  onPress={() => handleDelete(order.id)}
                  activeOpacity={0.8}
                  disabled={deleteMutation.isPending}
                >
                  <Ionicons name="trash-outline" size={18} color="#ffffff" />
                  <Text className="text-white font-semibold text-sm">حذف</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
            <Ionicons name="star-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 mb-2 text-start">لا توجد طلبات مميزة حالياً</Text>
            <Text className="text-gray-400 text-sm mb-6 text-start">
              ابدأ بإنشاء طلب مميز جديد ليظهر للعملاء في الصفحة الرئيسية
            </Text>
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-3 px-6"
              onPress={() => setShowCreateDialog(true)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">إنشاء أول طلب مميز</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      <DialogComponent />
      <CreateFeaturedOrderDialog
        visible={showCreateDialog}
        order={null}
        onClose={() => setShowCreateDialog(false)}
      />
    </ScrollView>
  );
}


