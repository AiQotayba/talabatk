import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Address } from '@/types/order.types';
import { AddressForm, type AddressFormData } from '@/components/addresses';
import Header from '@/components/ui/header';

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: address, isLoading: addressLoading } = useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const response = await apiClient.get<Address>(`/users/addresses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiClient.put(`/users/addresses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('نجح', 'تم تحديث العنوان بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل تحديث العنوان');
    },
  });

  const handleSubmit = async (data: AddressFormData) => {
    updateAddressMutation.mutate(data);
  };

  if (addressLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }

  if (!address) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <Text className="text-gray-500 text-right">العنوان غير موجود</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="تعديل العنوان" />

      <View className="px-6 py-4">
        <AddressForm
          mode="edit"
          initialData={address}
          onSubmit={handleSubmit}
          isSubmitting={updateAddressMutation.isPending}
          showMap={true}
          textDirection="rtl"
        />
      </View>
    </ScrollView>
  );
}
