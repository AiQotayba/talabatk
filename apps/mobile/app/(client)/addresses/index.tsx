import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Address } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AddressesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get<Address[]>('/users/addresses');
      return response.data || [];
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.delete(`/users/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('نجح', 'تم حذف العنوان بنجاح');
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل حذف العنوان');
    },
  });

  const handleDelete = (addressId: string) => {
    Alert.alert(
      'حذف العنوان',
      'هل أنت متأكد من حذف هذا العنوان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => deleteAddressMutation.mutate(addressId),
        },
      ]
    );
  };

  return (
    <View className="flex-1 my-10 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row items-center justify-between" style={{ direction: 'rtl' }}>
        <Text className="text-2xl font-bold text-gray-900 text-start">عناويني</Text>
        <TouchableOpacity
          onPress={() => router.push('/(client)/addresses/add')}
          className="bg-primary-600 rounded-xl px-4 py-2"
          activeOpacity={0.8}
          style={{
            shadowColor: '#E02020',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center gap-1" style={{ flexDirection: 'row' }}>
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text className="text-white font-bold text-sm">إضافة</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4">جاري تحميل العناوين...</Text>
          </View>
        ) : addresses && addresses.length > 0 ? (
          addresses.map((address, index) => (
            <Animated.View
              key={address.id}
              entering={FadeInDown.duration(400).delay(index * 50)}
            >
              <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row items-start justify-between" style={{ flexDirection: 'row' }}>
                  <View className="flex-row items-start flex-1" style={{ flexDirection: 'row' }}>
                    <View className="bg-primary-100 rounded-full p-2 mr-3">
                      <Ionicons name="location" size={24} color="#E02020" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2 gap-2" style={{ flexDirection: 'row' }}>
                        <Text className="font-bold text-gray-900 text-base">
                          {address.label || 'عنوان'}
                        </Text>
                        {address.is_default && (
                          <View className="bg-primary-100 px-2 py-1 rounded-lg">
                            <Text className="text-primary-700 text-xs font-bold">افتراضي</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-700 text-sm mb-1 text-start">{address.street}</Text>
                      <Text className="text-gray-600 text-sm text-start">{address.city}</Text>
                      {address.notes && (
                        <Text className="text-gray-500 text-sm mt-2 text-start">{address.notes}</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => router.push(`/(client)/addresses/${address.id}/edit`)}
                      activeOpacity={0.7}
                      className="bg-gray-100 rounded-lg p-2"
                    >
                      <Ionicons name="pencil" size={18} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(address.id)}
                      activeOpacity={0.7}
                      className="bg-error-100 rounded-lg p-2"
                    >
                      <Ionicons name="trash" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View entering={FadeInDown.duration(600)} className="py-16 items-center">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="location-outline" size={64} color="#d1d5db" />
            </View>
            <Text className="text-gray-500 text-center mt-4 mb-6 text-base">ما عندك عناوين حالياً</Text>
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-3 px-6"
              onPress={() => router.push('/(client)/addresses/add')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">إضافة أول عنوان</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}


