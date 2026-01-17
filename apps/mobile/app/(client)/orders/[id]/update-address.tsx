import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Address } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';

export default function UpdateOrderAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get<Address[]>('/users/addresses');
      return response.data || [];
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiClient.put(`/orders/${id}/address`, {
        dropoff_address_id: addressId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      Toast.success('تم التحديث بنجاح', 'تم تحديث عنوان التوصيل بنجاح! سيتم استخدام العنوان الجديد');
      router.back();
    },
    onError: (error: any) => {
      Toast.error('فشل التحديث', error.message || 'حدث خطأ أثناء تحديث العنوان. يرجى المحاولة مرة أخرى');
    },
  });

  const handleUpdate = () => {
    if (!selectedAddressId) {
      Toast.error('عنوان مطلوب', 'الرجاء اختيار عنوان التوصيل قبل المتابعة');
      return;
    }
    updateAddressMutation.mutate(selectedAddressId);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 my-8"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="تحديث عنوان التوصيل" description="اختر العنوان الجديد الذي تريد التوصيل إليه" />

      <View className="px-6 py-4" style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4">جاري تحميل العناوين...</Text>
          </View>
        ) : addresses && addresses.length > 0 ? (
          <>
            {addresses.map((address, index) => (
              <Animated.View
                key={address.id}
                entering={FadeInDown.duration(300).delay(index * 50)}
                className="mb-3"
              >
                <TouchableOpacity
                  className={`border-2 rounded-xl p-4 bg-white ${
                    selectedAddressId === address.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                  onPress={() => setSelectedAddressId(address.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center gap-3">
                      <View
                        className={`rounded-full p-2 ${
                          selectedAddressId === address.id ? 'bg-primary-600' : 'bg-gray-100'
                        }`}
                      >
                        <Ionicons
                          name="location"
                          size={20}
                          color={selectedAddressId === address.id ? '#ffffff' : '#6b7280'}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="font-bold text-gray-900 text-base">
                            {address.label || 'عنوان'}
                          </Text>
                          {address.is_default && (
                            <View className="bg-primary-100 px-2 py-0.5 rounded">
                              <Text className="text-primary-700 text-xs font-bold">افتراضي</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-700 text-sm">{address.street}</Text>
                        <Text className="text-gray-600 text-sm">{address.city}</Text>
                      </View>
                    </View>
                    {selectedAddressId === address.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#E02020" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <TouchableOpacity
              className="border-2 border-dashed border-primary-600 rounded-xl p-4 mt-4 mb-6"
              onPress={() => router.push('/(client)/addresses/add')}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="add-circle" size={20} color="#E02020" />
                <Text className="text-primary-600 text-center font-semibold text-base">
                  إضافة عنوان جديد
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-4 mb-6"
              onPress={handleUpdate}
              disabled={!selectedAddressId || updateAddressMutation.isPending}
              activeOpacity={0.8}
            >
              {updateAddressMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                  <Text className="text-white font-bold text-lg">تحديث العنوان</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center">
            <Ionicons name="location-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 mb-2 text-start">ما عندك عناوين حالياً</Text>
            <Text className="text-gray-400 text-sm mb-6 text-start">أضف عنواناً جديداً لتتمكن من تحديث عنوان التوصيل</Text>
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-3 px-6"
              onPress={() => router.push('/(client)/addresses/add')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">إضافة عنوان جديد</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}


