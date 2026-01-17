import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  // BarCodeScanner,
  BarCodeScannerResult
} from 'expo-barcode-scanner';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/ui/header';
import { Toast } from '@/utils/toast';

export default function AdminScanQRCodeScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      // const { status } = await BarCodeScanner.requestPermissionsAsync();
      // setHasPermission(status === 'granted');
    })();
  }, []);

  const scanMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.post('/orders/scan-qr', { code });
      return response.data;
    },
    onSuccess: (order) => {
      Toast.success('تم العثور على الطلب', 'تم العثور على الطلب بنجاح! يمكنك الآن عرض تفاصيله');
      router.push(`/(admin)/orders/${order.id}`);
    },
    onError: (error: any) => {
      Toast.error('فشل المسح', error.message || 'حدث خطأ أثناء مسح رمز QR. يرجى التحقق من الرمز والمحاولة مرة أخرى');
      setScanned(false);
    },
  });

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;
    setScanned(true);
    scanMutation.mutate(data);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#E02020" />
        <Text className="text-gray-500 mt-4">طلب الإذن...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-gray-50" style={{ direction: 'rtl' }}>
        <Header title="مسح رمز QR" description="امسح رمز QR للطلب" />
        <View className="px-6 py-8 items-center">
          <Ionicons name="camera-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-center mt-4 mb-6">
            نحتاج إلى إذن للوصول إلى الكاميرا
          </Text>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-3 px-6"
            onPress={async () => {
              // const { status } = await BarCodeScanner.requestPermissionsAsync();
              // setHasPermission(status === 'granted');
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">منح الإذن</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ direction: 'rtl' }}>
      <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 pt-12 pb-4 px-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold text-start">مسح رمز QR</Text>
        <Text className="text-white/80 text-sm text-start mt-1">
          ضع رمز QR داخل الإطار
        </Text>
      </View>

      {/* <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
        barCodeTypes={['qr']}
      />

      {/* Scanning overlay */}
      <View className="absolute inset-0 items-center justify-center">
        <View className="w-64 h-64 border-4 border-primary-600 rounded-lg" />
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <View className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-600" />
          <View className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-600" />
          <View className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-600" />
          <View className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-600" />
        </View>
      </View>

      {scanMutation.isPending && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="bg-white rounded-xl p-6">
            <ActivityIndicator size="large" color="#E02020" />
            <Text className="text-gray-900 mt-4 text-center">جاري التحقق من الطلب...</Text>
          </View>
        </View>
      )}

      {scanned && !scanMutation.isPending && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={() => setScanned(false)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-center text-lg">مسح مرة أخرى</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


