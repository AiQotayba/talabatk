import { View, Text, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Tabs, { TabItem } from '@/components/ui/tabs';
import { Order } from '@/types/order.types';
import { router } from 'expo-router';
import Header from '@/components/ui/header';

const ORDER_STATUS_TABS: TabItem[] = [
    { id: 'all', label: 'الكل', icon: 'list' },
    { id: 'pending', label: 'معلقة', icon: 'time' },
    { id: 'assigned', label: 'معينة', icon: 'person-add' },
    { id: 'in_progress', label: 'قيد التنفيذ', icon: 'car' },
    { id: 'delivered', label: 'مكتملة', icon: 'checkmark-circle' },
];

export default function AdminMapScreen() {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const { data: orders, isLoading, refetch }: any = useQuery({
        queryKey: ['admin-map-orders', activeTab],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>('/admin/map', {
                params: { status: activeTab },
            });
            return response.data || [];
        },
    });

    // Filter orders with valid coordinates
    const ordersWithLocation = orders?.filter(
        (order: any) =>
            order.address?.lat &&
            order.address?.lng &&
            order.address.lat !== 0 &&
            order.address.lng !== 0
    ) || [];

    // Calculate map region to show all orders
    const getMapRegion = () => {
        if (ordersWithLocation.length === 0) {
            return {
                latitude: 36.0156, // Maarat Misrin default
                longitude: 36.6731,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };
        }

        const lats = ordersWithLocation.map((o: any) => o.address!.lat!);
        const lngs = ordersWithLocation.map((o: any) => o.address!.lng!);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latDelta = (maxLat - minLat) * 1.5 || 0.1;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.1;

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latDelta, 0.01),
            longitudeDelta: Math.max(lngDelta, 0.01),
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return '#16a34a';
            case 'cancelled':
                return '#dc2626';
            case 'pending':
            case 'assigned':
                return '#d97706';
            default:
                return '#E02020';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'checkmark-circle';
            case 'cancelled':
                return 'close-circle';
            case 'pending':
                return 'time';
            case 'assigned':
                return 'person-add';
            default:
                return 'location';
        }
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ direction: 'rtl' }}>
            <View className="bg-white px-6 py-4 border-b border-gray-200">
                <Header title="خريطة الطلبات" description={`${ordersWithLocation.length} طلب على الخريطة`} />
                <View className="mt-4">
                    <Tabs tabs={ORDER_STATUS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E02020" />
                    <Text className="text-gray-500 mt-4 text-right">جاري تحميل الخريطة...</Text>
                </View>
            ) : (
                <View className="flex-1">
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={getMapRegion()}
                        region={getMapRegion()}
                    >
                        <UrlTile
                            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maximumZ={19}
                        />
                        {ordersWithLocation.map((order: any) => {
                            const color = getStatusColor(order.status);
                            return (
                                <Marker
                                    key={order.id}
                                    coordinate={{
                                        latitude: order.address!.lat!,
                                        longitude: order.address!.lng!,
                                    }}
                                    onPress={() => setSelectedOrder(order)}
                                >
                                    <View className="items-center">
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center border-2 border-white"
                                            style={{ backgroundColor: color }}
                                        >
                                            <Ionicons name={getStatusIcon(order.status) as any} size={16} color="#ffffff" />
                                        </View>
                                    </View>
                                </Marker>
                            );
                        })}
                    </MapView>

                    {selectedOrder && (
                        <Animated.View
                            entering={FadeInDown.duration(300)}
                            className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg"
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 text-start mb-1">
                                        طلب #{selectedOrder.code_order}
                                    </Text>
                                    <Text className="text-sm text-gray-600 text-start mb-2">
                                        {selectedOrder?.address?.street}, {selectedOrder?.address?.city}
                                    </Text>
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{ backgroundColor: `${getStatusColor(selectedOrder.status)}20` }}
                                        >
                                            <Text
                                                className="text-xs font-semibold"
                                                style={{ color: getStatusColor(selectedOrder.status) }}
                                            >
                                                {selectedOrder.status === 'pending' ? 'معلقة' :
                                                    selectedOrder.status === 'assigned' ? 'معينة' :
                                                        selectedOrder.status === 'accepted' ? 'مقبولة' :
                                                            selectedOrder.status === 'picked_up' ? 'تم الاستلام' :
                                                                selectedOrder.status === 'in_transit' ? 'قيد التوصيل' :
                                                                    selectedOrder.status === 'delivered' ? 'مكتملة' :
                                                                        selectedOrder.status === 'cancelled' ? 'ملغاة' : selectedOrder.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                                    <Ionicons name="close" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                className="mt-3 bg-primary-600 rounded-lg py-2 px-4"
                                onPress={() => {
                                    router.push(`/(admin)/orders/${selectedOrder.id}` as any);
                                }}
                            >
                                <Text className="text-white font-semibold text-center">عرض التفاصيل</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {ordersWithLocation.length === 0 && (
                        <View className="absolute inset-0 items-center justify-center bg-white/80">
                            <Ionicons name="map-outline" size={64} color="#d1d5db" />
                            <Text className="text-gray-500 text-right mt-4">لا توجد طلبات على الخريطة</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

