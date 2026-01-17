import { View, Text, TouchableOpacity, Modal, ScrollView, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import ContactCard from '../atoms/ContactCard';

interface OrderDetailsDialogProps {
    visible: boolean;
    order: any
    onClose: () => void;
    onAccept?: (orderId: string) => void;
    onReject?: (orderId: string) => void;
    isLoading?: boolean;
}

export default function OrderDetailsDialog({
    visible,
    order,
    onClose,
    onAccept,
    onReject,
    isLoading = false,
}: OrderDetailsDialogProps) {
    if (!order) return null;

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const formatPrice = (cents: number | null | undefined) => {
        if (!cents) return 'غير محدد';
        return `${cents} ل.ت`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-4" style={{ direction: 'rtl' }}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90%]"
                    style={{ direction: 'rtl' }}
                >
                    <View className="p-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Ionicons name="receipt-outline" size={24} color="#E02020" />
                                    <Text className="font-bold text-gray-900 text-lg">
                                        طلب #{order.code_order || order.id?.slice(0, 8)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
                            {/* Order Content */}
                            <View className="mb-4">
                                <Text className="text-sm text-gray-600 mb-2 text-start">التفاصيل</Text>
                                <Text className="text-gray-900 text-base leading-6 text-start bg-gray-50 p-3 rounded-lg">
                                    {order.content}
                                </Text>
                            </View>

                            <ContactCard order={order} role="client" />

                            {/* Costs */}
                            <View className="mb-4">
                                <Text className="text-sm text-gray-600 mb-2 text-start">التكاليف</Text>
                                <View className="bg-gray-50 p-3 rounded-lg ">
                                    <View className="flex-row items-center justify-start gap-2">
                                        <Text className="text-gray-700 text-base text-start">السعر</Text>
                                        <Text className="font-bold text-gray-900 text-lg text-start">
                                            {formatPrice((order as any).price_cents)}
                                        </Text>
                                    </View>
                                    {order.payment_method && (
                                        <View className="flex-row items-center gap-2 mt-2">
                                            <Ionicons name="card-outline" size={16} color="#6b7280" />
                                            <Text className="text-gray-600 text-sm text-start">
                                                طريقة الدفع: {order.payment_method === 'cash' ? 'نقدي' : 'بطاقة'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Address */}
                            {order.address && (
                                <View className="mb-4">
                                    <Text className="text-sm text-gray-600 mb-2 text-start">العنوان</Text>
                                    <View className="bg-gray-50 p-3 rounded-lg">
                                        <View className="flex-row items-start gap-2 mb-3">
                                            <Ionicons name="location" size={18} color="#E02020" />
                                            <View className="flex-1">
                                                <Text className="text-gray-900 text-base text-start">
                                                    {order.address.street}
                                                </Text>
                                                <Text className="text-gray-600 text-sm text-start mt-1">
                                                    {order.address.city}
                                                </Text>
                                                {order.address.notes && (
                                                    <Text className="text-gray-500 text-xs text-start mt-1">
                                                        {order.address.notes}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Embedded Map */}
                                        {order.address.lat && order.address.lng && (
                                            <View className="mt-3 rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }}>
                                                <MapView
                                                    style={{ flex: 1 }}
                                                    initialRegion={{
                                                        latitude: order.address.lat,
                                                        longitude: order.address.lng,
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
                                                            latitude: order.address.lat,
                                                            longitude: order.address.lng,
                                                        }}
                                                        title="موقع التوصيل"
                                                        description={order.address.street}
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
                            )}

                            {/* Client Location Details */}
                            {order.address && (
                                (order.address.building_number ||
                                    (order.address.building_image_url && order.address.building_image_url !== 'null') ||
                                    (order.address.door_image_url && order.address.door_image_url !== 'null')) && (
                                    <View className="mb-4">
                                        <Text className="text-sm text-gray-600 mb-2 text-start">مكان العميل</Text>
                                        <View className="bg-gray-50 p-3 rounded-lg">
                                            {order.address.building_number && order.address.building_number !== 'null' && (
                                                <View className="mb-3">
                                                    <View className="flex-row items-center gap-2 mb-1">
                                                        <Ionicons name="home-outline" size={16} color="#6b7280" />
                                                        <Text className="text-gray-600 text-sm text-start">رقم المبنى</Text>
                                                    </View>
                                                    <Text className="text-gray-900 text-base text-start font-semibold">
                                                        {order.address.building_number}
                                                    </Text>
                                                </View>
                                            )}

                                            {order.address.building_image_url && order.address.building_image_url !== 'null' && (
                                                <View className="mb-3">
                                                    <Text className="text-gray-600 text-sm text-start mb-2">صورة البناء</Text>
                                                    <Image
                                                        source={{ uri: order.address.building_image_url }}
                                                        className="w-full rounded-lg"
                                                        style={{ height: 150, resizeMode: 'cover' }}
                                                    />
                                                </View>
                                            )}

                                            {order.address.door_image_url && order.address.door_image_url !== 'null' && (
                                                <View>
                                                    <Text className="text-gray-600 text-sm text-start mb-2">صورة باب المنزل</Text>
                                                    <Image
                                                        source={{ uri: order.address.door_image_url }}
                                                        className="w-full rounded-lg"
                                                        style={{ height: 150, resizeMode: 'cover' }}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            )}

                        </ScrollView>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                            {onReject && (
                                <TouchableOpacity
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-red-200 bg-red-50"
                                    onPress={() => onReject(order.id)}
                                    disabled={isLoading}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-center font-semibold text-red-600">رفض</Text>
                                </TouchableOpacity>
                            )}
                            {onAccept && (
                                <TouchableOpacity
                                    className="flex-1 py-3 px-4 rounded-xl bg-primary-600"
                                    onPress={() => onAccept(order.id)}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-center font-semibold text-white">قبول</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

