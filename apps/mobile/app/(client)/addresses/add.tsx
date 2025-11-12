import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { AddressForm, type AddressFormData } from '@/components/addresses';
import Header from '@/components/ui/header';

export default function AddAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiClient.post('/users/addresses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('نجح', 'تم إضافة العنوان بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إضافة العنوان');
    },
  });

  const handleSubmit = async (data: AddressFormData) => {
    createAddressMutation.mutate(data);
  };

  return (
    <ScrollView className="flex-1 my-10 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="إضافة عنوان جديد" />

      <View className="px-6 py-4">
        <AddressForm
          mode="add"
          onSubmit={handleSubmit}
          isSubmitting={createAddressMutation.isPending}
          showMap={true}
          textDirection="rtl"
        />
      </View>
    </ScrollView>
  );
}
