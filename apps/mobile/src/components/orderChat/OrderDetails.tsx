import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Order } from '@/types/order.types';
import { OrderChatRole } from './types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import ContactCard from '../atoms/ContactCard';
import Tabs from '../ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';

interface OrderDetailsProps {
  order: Order;
  role?: OrderChatRole;
}

export default function OrderDetails({ order, role }: OrderDetailsProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'address' | 'contact'>('address');

  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return 'غير محدد';
    return `${cents} ل.ت`;
  };

  // Fetch QR code
  const { data: qrCodeData, isLoading: isLoadingQR } = useQuery({
    queryKey: ['order-qr-code', order.id],
    queryFn: async () => {
      const response = await apiClient.get<{ qr_code: string; order_code: string }>(`/orders/${order.id}/qr-code`);
      return response.data;
    },
    enabled: showQRCode,
  });

  return (
    <>
      <View className="bg-gray-50 m-4 px-4 py-3 rounded-xl shadow-md" style={{ direction: 'rtl' }}>
        <View className="flex-row items-start justify-between mb-3">
          <TouchableOpacity onPress={() => setShowFullDetails(true)} activeOpacity={0.7} className="flex-1">
            <Text className="text-gray-700 text-sm font-thin text-start leading-6" numberOfLines={3}>{order.content || ''}</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            {order.code_order && (
              <TouchableOpacity
                onPress={() => setShowQRCode(true)}
                activeOpacity={0.7}
                className="bg-primary-100 rounded-lg px-3 py-2"
              >
                <Ionicons name="qr-code" size={20} color="#E02020" />
              </TouchableOpacity>
            )}
            <AntDesign name="pushpin" size={20} color="#ddd" />
          </View>
        </View>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRCode(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6"
            style={{ direction: 'rtl' }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900 text-start">رمز QR للطلب</Text>
              <TouchableOpacity onPress={() => setShowQRCode(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {isLoadingQR ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#E02020" />
                <Text className="text-gray-500 mt-4">جاري توليد رمز QR...</Text>
              </View>
            ) : qrCodeData ? (
              <>
                <View className="items-center mb-4">
                  <Image
                    source={{ uri: qrCodeData.qr_code }}
                    className="w-64 h-64 rounded-lg"
                    style={{ resizeMode: 'contain' }}
                  />
                </View>
                <View className="bg-gray-50 rounded-lg p-3 mb-4">
                  <Text className="text-sm text-gray-600 text-center mb-1">رمز الطلب</Text>
                  <Text className="text-lg font-bold text-gray-900 text-center">{qrCodeData.order_code}</Text>
                </View>
                <TouchableOpacity
                  className="bg-primary-600 rounded-xl py-3"
                  onPress={() => setShowQRCode(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-center">إغلاق</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="py-12 items-center">
                <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 mt-4">فشل توليد رمز QR</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Full Details Modal */}
      <Modal
        visible={showFullDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullDetails(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90%]"
            style={{ direction: 'rtl' }}
          >
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">تفاصيل الطلب الكاملة</Text>
                <TouchableOpacity onPress={() => setShowFullDetails(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[70vh]">
                {/* Order Content */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2 text-start">التفاصيل</Text>
                  <Text className="text-gray-900 text-base leading-6 text-start bg-gray-50 p-3 rounded-lg">
                    {order.content || ''}
                  </Text>
                </View>

                {/* Costs */}
                <View className="mb-4">
                  <Text className="text-sm text-gray-600 mb-2 text-start">التكاليف</Text>
                  <View className="bg-gray-50 p-3 rounded-lg">
                    <View className="flex-row items-center justify-start gap-2">
                      <Text className="text-gray-700 text-base text-start">السعر</Text>
                      <Text className="font-bold text-gray-900 text-lg text-start">
                        {formatPrice((order as any).price_cents)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Tabs */}
                <View className="mb-4">
                  <Tabs
                    tabs={[
                      {
                        id: 'address',
                        label: 'العنوان',
                        icon: 'location-outline',
                      },
                      {
                        id: 'contact',
                        label: 'جهات الاتصال',
                        icon: 'people-outline',
                      },
                    ]}
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as 'address' | 'contact')}
                  />
                </View>

                {/* Tab Content */}
                {activeTab === 'contact' && (
                  <View className="mb-4">
                    {order.client && <ContactCard order={order} role="client" />}
                    {order.driver && <ContactCard order={order} role="driver" />}
                    {!order.client && !order.driver && (
                      <View className="bg-gray-50 p-4 rounded-lg">
                        <Text className="text-gray-500 text-start">لا توجد جهات اتصال متاحة</Text>
                      </View>
                    )}
                  </View>
                )}

                {activeTab === 'address' && (
                  <View className="mb-4">
                    {(order as any).address ? (
                      <>
                        {/* Address */}
                        <View className="mb-4">
                          <Text className="text-sm text-gray-600 mb-2 text-start">العنوان</Text>
                          <View className="bg-gray-50 p-3 rounded-lg">
                            <View className="flex-row items-start gap-2 mb-3">
                              <Ionicons name="location" size={18} color="#E02020" />
                              <View className="flex-1">
                                <Text className="text-gray-900 text-base text-start">
                                  {(order as any).address.street || 'لا يوجد شارع'}
                                </Text>
                                <Text className="text-gray-600 text-sm text-start mt-1">
                                  {(order as any).address.city || 'لا يوجد مدينة'}
                                </Text>
                                {(order as any).address.notes && (
                                  <Text className="text-gray-500 text-xs text-start mt-1">
                                    {(order as any).address.notes}
                                  </Text>
                                )}
                              </View>
                            </View>

                            {/* Embedded Map */}
                            {(order as any).address.lat && (order as any).address.lng && (
                              <View className="mt-3 rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }}>
                                <MapView
                                  style={{ flex: 1 }}
                                  initialRegion={{
                                    latitude: (order as any).address.lat,
                                    longitude: (order as any).address.lng,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                  }}
                                  scrollEnabled={true}
                                  zoomEnabled={true}
                                  pitchEnabled={false}
                                  rotateEnabled={false}
                                >
                                  <UrlTile
                                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maximumZ={19}
                                  />
                                  <Marker
                                    coordinate={{
                                      latitude: (order as any).address.lat,
                                      longitude: (order as any).address.lng,
                                    }}
                                    title="موقع التوصيل"
                                    description={(order as any).address.street || 'موقع التوصيل'}
                                  >
                                    <View className="items-center justify-center">
                                      <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center border-2 border-white">
                                        <Ionicons name="location" size={20} color="#ffffff" />
                                      </View>
                                    </View>
                                  </Marker>
                                </MapView>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Client Location Details */}
                        {((order as any).address.building_number ||
                          ((order as any).address.building_image_url && (order as any).address.building_image_url !== 'null') ||
                          ((order as any).address.door_image_url && (order as any).address.door_image_url !== 'null')) && (
                            <View className="mb-4">
                              <Text className="text-sm text-gray-600 mb-2 text-start">مكان العميل</Text>
                              <View className="bg-gray-50 p-3 rounded-lg">
                                {(order as any).address.building_number && (order as any).address.building_number !== 'null' && (
                                  <View className="mb-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                      <Ionicons name="home-outline" size={16} color="#6b7280" />
                                      <Text className="text-gray-600 text-sm text-start">رقم المبنى</Text>
                                    </View>
                                    <Text className="text-gray-900 text-base text-start font-semibold">
                                      {(order as any).address.building_number || ''}
                                    </Text>
                                  </View>
                                )}

                                {(order as any).address.building_image_url && (order as any).address.building_image_url !== 'null' && (
                                  <View className="mb-3">
                                    <Text className="text-gray-600 text-sm text-start mb-2">صورة البناء</Text>
                                    <Image
                                      source={{ uri: (order as any).address.building_image_url }}
                                      className="w-full rounded-lg"
                                      style={{ height: 150, resizeMode: 'cover' }}
                                    />
                                  </View>
                                )}

                                {(order as any).address.door_image_url && (order as any).address.door_image_url !== 'null' && (
                                  <View>
                                    <Text className="text-gray-600 text-sm text-start mb-2">صورة باب المنزل</Text>
                                    <Image
                                      source={{ uri: (order as any).address.door_image_url }}
                                      className="w-full rounded-lg"
                                      style={{ height: 150, resizeMode: 'cover' }}
                                    />
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                      </>
                    ) : (
                      <View className="bg-gray-50 p-4 rounded-lg">
                        <Text className="text-gray-500 text-start">لا يوجد عنوان متاح</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Order Info */}
                <View className="mb-4">
                  <View className="bg-gray-50 p-3 rounded-lg">
                    <View className="flex-row items-center justify-start gap-2">
                      <Text className="text-gray-600 text-sm text-start">تاريخ الإنشاء</Text>
                      <Text className="font-semibold text-gray-900 text-sm text-start">
                        {new Date(order.created_at).toLocaleString('ar-SA')}
                      </Text>
                    </View>
                    {order.delivered_at && (
                      <View className="flex-row items-center justify-start gap-2 mt-2">
                        <Text className="text-gray-600 text-sm text-start">تاريخ التسليم</Text>
                        <Text className="font-semibold text-gray-900 text-sm text-start">
                          {new Date(order.delivered_at).toLocaleString('ar-SA')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}