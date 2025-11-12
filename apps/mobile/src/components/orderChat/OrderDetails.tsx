import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderChatRole } from './types';

interface OrderDetailsProps {
  order: Order;
  role?: OrderChatRole;
}

export default function OrderDetails({ order, role }: OrderDetailsProps) {
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="bg-gray-50 px-4 py-3 border-b border-gray-200" style={{ direction: 'rtl' }}>
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="information-circle-outline" size={20} color="#E02020" />
        <Text className="font-bold text-gray-900 text-base">تفاصيل الطلب</Text>
      </View>

      <Text className="text-gray-700 mb-3 text-start leading-6">{order.content}</Text>

      {order.dropoff_address && (
        <View className="flex-row items-start mt-2 mb-2">
          <Ionicons name="location" size={18} color="#E02020" />
          <Text className="text-gray-700 text-sm mr-2 flex-1 text-start">
            {order.dropoff_address.street}, {order.dropoff_address.city}
          </Text>
          {role === 'driver' && order.dropoff_address.lat && order.dropoff_address.lng && (
            <TouchableOpacity
              className="bg-primary-100 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${order.dropoff_address!.lat},${order.dropoff_address!.lng}`;
                Linking.openURL(url);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={16} color="#E02020" />
              <Text className="text-primary-600 font-semibold text-xs">تنقل</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Client info for driver */}
      {role === 'driver' && order.client && (
        <View className="flex bg-white rounded-lg p-3 mt-3 mb-2 " style={{ direction: 'rtl' }}>
          <View className="flex-row gap-2 items-center justify-between">
            {order.client.profile_photo_url ? (
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                <Ionicons name="person" size={24} color="#E02020" />
              </View>
            ) : (
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                <Ionicons name="person" size={24} color="#E02020" />
              </View>
            )}
            <View className="flex-1 mx-2 flex-col items-start justify-start">
              <Text className="text-xs text-gray-600 text-right mb-1">العميل</Text>
              <Text className="font-bold text-gray-900 text-base text-right">{order.client.name}</Text>
              {order.client.phone && (
                <TouchableOpacity
                  className="flex-row items-center gap-2 mt-2 text-start"
                  onPress={() => handleCall(order.client!.phone!)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={16} color="#E02020" />
                  <Text className="text-primary-600 font-semibold text-sm text-end" style={{ unicodeBidi: 'plaintext' }}>{order.client.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Driver info for client */}
      {role === 'client' && order.driver && (
        <View className="items-start">
          <Text className="text-xs text-gray-600 text-right">المندوب</Text>
          <Text className="font-bold text-gray-900 text-base text-right">{order.driver.name}</Text>
        </View>
      )}
    </View>
  );
}

