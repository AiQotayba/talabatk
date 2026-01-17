import { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';

export default function AdminOrderQRCodeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: qrCodeData, isLoading } = useQuery({
    queryKey: ['order-qr-code', id],
    queryFn: async () => {
      const response = await apiClient.get<{ qr_code: string; order_code: string }>(`/orders/${id}/qr-code`);
      return response.data;
    },
    enabled: !!id,
  });

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      style={{ direction: 'rtl' }}
    >
      <Header title="رمز QR للطلب" description="اعرض هذا الرمز للسائق لمسحه وتأكيد التسليم" />

      <View className="px-6 py-8 items-center" style={{ direction: 'rtl' }}>
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-500 mt-4">جاري توليد رمز QR...</Text>
          </View>
        ) : qrCodeData ? (
          <>
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <Image
                source={{ uri: qrCodeData.qr_code }}
                className="w-80 h-80 rounded-lg"
                style={{ resizeMode: 'contain' }}
              />
            </View>
            <View className="bg-white rounded-xl p-4 mb-6 w-full">
              <Text className="text-sm text-gray-600 text-center mb-2">رمز الطلب</Text>
              <Text className="text-2xl font-bold text-gray-900 text-center">{qrCodeData.order_code}</Text>
            </View>
          </>
        ) : (
          <View className="py-12 items-center">
            <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-start">فشل تحميل رمز QR</Text>
            <Text className="text-gray-400 text-sm mt-2 text-start">حدث خطأ أثناء تحميل رمز QR. يرجى المحاولة مرة أخرى</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


