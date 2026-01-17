import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Address } from '@/types/order.types';
import { CreateOrderRequest } from '@/types/order.types';
import { addOrder } from '@/store/slices/orders.slice';
import { useAppDispatch } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '@/components/ui/header';

const createOrderSchema = z.object({
  content: z.string().min(10, 'وصف الطلب يجب أن يكون على الأقل 10 أحرف'),
  dropoff_address_id: z.string().min(1, 'الرجاء اختيار عنوان'),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export default function CreateOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ featuredOrderContext?: string }>();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // Fetch addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get<Address[]>('/users/addresses');
      return response.data || [];
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      content: params.featuredOrderContext || '',
      // payment_method: 'cash',
    },
  });

  // Pre-fill content if coming from featured order
  useEffect(() => {
    if (params.featuredOrderContext) {
      setValue('content', params.featuredOrderContext);
    }
  }, [params.featuredOrderContext, setValue]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await apiClient.post('/orders', data);
      return response.data;
    },
    onSuccess: (newOrder) => {
      dispatch(addOrder(newOrder));
      queryClient.invalidateQueries({ queryKey: ['client-orders'] });
      router.replace(`/(client)/orders/${newOrder.id}`);
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إنشاء الطلب');
    },
  });

  const onSubmit = (data: CreateOrderFormData) => {
    createOrderMutation.mutate({
      content: data.content,
      dropoff_address_id: data.dropoff_address_id
    });
  };

  return (
    <ScrollView className="flex-1 my-10 bg-gray-50" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <Header title="إنشاء طلب جديد" />

      <View className="px-6 py-4">
        {/* Order Description */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">وصف الطلب</Text>
            <Controller
              control={control}
              name="content"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-white min-h-24"
                  placeholder="اكتب ما تريد طلبه..."
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ textAlign: 'right' }}
                />
              )}
            />
            {errors.content && (
              <Text className="text-red-500 text-sm mt-2 text-start">{errors.content.message}</Text>
            )}
          </View>
        </Animated.View>

        {/* Select Address */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-3 text-start">عنوان التوصيل</Text>
            {addressesLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#E02020" />
                <Text className="text-gray-500 mt-4">جاري تحميل العناوين...</Text>
              </View>
            ) : addresses && addresses.length > 0 ? (
              <>
                <TouchableOpacity
                  className="border-2 border-gray-300 rounded-xl p-4 bg-white"
                  onPress={() => setIsSelectOpen(true)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <View className="flex-1" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location" size={20} color="#E02020" style={{ marginRight: 12 }} />
                    <View className="flex-1">
                      {selectedAddressId ? (
                        <>
                          <Text className="font-semibold text-gray-900 text-base">
                            {addresses.find(a => a.id === selectedAddressId)?.label || 'عنوان'}
                          </Text>
                          <Text className="text-gray-600 text-sm mt-1">
                            {addresses.find(a => a.id === selectedAddressId)?.street}, {addresses.find(a => a.id === selectedAddressId)?.city}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-gray-400 text-base">اختر عنوان التوصيل</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>

                {/* Select Modal */}
                <Modal
                  visible={isSelectOpen}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setIsSelectOpen(false)}
                >
                  <TouchableOpacity
                    className="flex-1 bg-black/50"
                    activeOpacity={1}
                    onPress={() => setIsSelectOpen(false)}
                  >
                    <View className="flex-1 justify-end">
                      <View className="bg-white rounded-t-3xl p-6 max-h-[80%]" style={{ direction: 'rtl' }}>
                          <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-900">اختر العنوان</Text>
                            <TouchableOpacity onPress={() => setIsSelectOpen(false)}>
                              <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                          </View>

                          <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="gap-3">
                              {addresses.map((address) => (
                                <TouchableOpacity
                                  key={address.id}
                                  className={`border-2 rounded-xl p-4 ${
                                    selectedAddressId === address.id
                                      ? 'border-primary-600 bg-primary-50'
                                      : 'border-gray-200 bg-white'
                                  }`}
                                  onPress={() => {
                                    setSelectedAddressId(address.id);
                                    setValue('dropoff_address_id', address.id);
                                    setIsSelectOpen(false);
                                  }}
                                  activeOpacity={0.7}
                                  style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                  <View className="flex-1" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View className={`rounded-full p-2 mr-3 ${selectedAddressId === address.id ? 'bg-primary-600' : 'bg-gray-100'}`}>
                                      <Ionicons
                                        name="location"
                                        size={20}
                                        color={selectedAddressId === address.id ? '#ffffff' : '#6b7280'}
                                      />
                                    </View>
                                    <View className="flex-1">
                                      <View className="flex-row items-center gap-2 mb-1" style={{ flexDirection: 'row' }}>
                                        <Text className="font-bold text-gray-900 text-base">
                                          {address.label || 'عنوان'}
                                        </Text>
                                        {address.is_default && (
                                          <View className="bg-primary-100 px-2 py-0.5 rounded">
                                            <Text className="text-primary-700 text-xs font-bold">افتراضي</Text>
                                          </View>
                                        )}
                                      </View>
                                      <Text className="text-gray-700 text-sm">
                                        {address.street}, {address.city}
                                      </Text>
                                    </View>
                                  </View>
                                  {selectedAddressId === address.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#E02020" />
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>

                          <TouchableOpacity
                            className="border-2 border-dashed border-primary-600 rounded-xl p-4 mt-4"
                            onPress={() => {
                              setIsSelectOpen(false);
                              router.push('/(client)/addresses/add');
                            }}
                            activeOpacity={0.7}
                          >
                            <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row' }}>
                              <Ionicons name="add-circle" size={20} color="#E02020" />
                              <Text className="text-primary-600 text-center font-semibold text-base">
                                إضافة عنوان جديد
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            ) : (
              <TouchableOpacity
                className="border-2 border-dashed border-primary-600 rounded-xl p-4"
                onPress={() => router.push('/(client)/addresses/add')}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row' }}>
                  <Ionicons name="add-circle" size={20} color="#E02020" />
                  <Text className="text-primary-600 text-center font-semibold text-base">
                    إضافة أول عنوان
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {errors.dropoff_address_id && (
              <Text className="text-red-500 text-sm mt-2 text-start">
                {errors.dropoff_address_id.message}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-5 mb-6"
            onPress={handleSubmit(onSubmit)}
            disabled={createOrderMutation.isPending}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {createOrderMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row' }}>
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                <Text className="text-white text-center font-bold text-lg">
                  إنشاء الطلب
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


