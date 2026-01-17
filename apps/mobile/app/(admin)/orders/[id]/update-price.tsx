import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';

export default function UpdateOrderPriceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [price, setPrice] = useState('');

  // Fetch current order to show current price
  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.get(`/orders/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const updatePriceMutation = useMutation({
    mutationFn: async (price: number) => {
      const response = await apiClient.put(`/orders/${id}/price`, { price });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      Toast.success('تم التحديث بنجاح', 'تم تحديث سعر الطلب بنجاح! سيتم إشعار العميل بالتغيير');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('فشل التحديث', error.message || 'حدث خطأ أثناء تحديث السعر. يرجى المحاولة مرة أخرى');
    },
  });

  const handleUpdate = () => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Toast.error('سعر غير صحيح', 'الرجاء إدخال سعر صحيح (رقم أكبر من أو يساوي صفر)');
      return;
    }
    updatePriceMutation.mutate(priceNum);
  };

  const currentPrice = order?.price ? (order.price / 100).toFixed(2) : 'غير محدد';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="تحديث سعر الطلب" description="قم بتعديل سعر الطلب. سيتم إشعار العميل بأي تغيير" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        {order && (
          <View className="bg-white rounded-xl p-4 mb-4 border-2 border-gray-200">
            <Text className="text-sm text-gray-600 mb-1 text-start">السعر الحالي</Text>
            <Text className="text-2xl font-bold text-gray-900 text-start">{currentPrice} ل.ت</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">السعر الجديد</Text>
          <View className="bg-white border-2 border-gray-200 rounded-xl p-4 flex-row items-center">
            <TextInput
              className="flex-1 text-2xl font-bold text-gray-900"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={price}
              onChangeText={(text) => {
                // Only allow numbers and one decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                if (parts.length > 2) return;
                if (parts[1] && parts[1].length > 2) return;
                setPrice(cleaned);
              }}
              keyboardType="decimal-pad"
              style={{ textAlign: 'right' }}
            />
            <Text className="text-xl text-gray-600 mr-2">ل.ت</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 mb-6"
          onPress={handleUpdate}
          disabled={!price || updatePriceMutation.isPending}
          activeOpacity={0.8}
        >
          {updatePriceMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text className="text-white font-bold text-lg">تحديث السعر</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


