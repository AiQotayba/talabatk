import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';

interface ContactCardProps {
  order: Order;
  role: 'client' | 'driver';
}

export default function ContactCard({ order, role }: ContactCardProps) {
  const phone = role === 'client' ? order.client?.phone : order.driver?.phone;
  const name = role === 'client' ? order.client?.name : order.driver?.name;
  const profile_photo_url = role === 'client' ? order.client?.profile_photo_url : order.driver?.profile_photo_url;

  if (!phone || !name) {
    return null;
  }

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-2 text-start">
        {role === 'client' ? 'معلومات العميل' : 'معلومات المندوب'}
      </Text>
      <View className="bg-gray-50 p-3 rounded-lg">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
            {profile_photo_url ? (
              <Image source={{ uri: profile_photo_url }} className="w-full h-full rounded-full" />
            ) : (
              <Ionicons name="person" size={24} color="#E02020" />
            )}
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-base text-start">
              {name || ''}
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-2 mt-1"
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#E02020" />
              <Text className="text-primary-600 font-semibold text-sm text-start flex-1" style={{ unicodeBidi: 'plaintext' }}>
                {phone ? phone.replace('+', '00') : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

