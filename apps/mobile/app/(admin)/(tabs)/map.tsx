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

const MAP_TYPE_TABS: TabItem[] = [
    { id: 'orders', label: 'الطلبات', icon: 'receipt' },
    { id: 'drivers', label: 'السائقين', icon: 'car' },
    { id: 'both', label: 'الكل', icon: 'layers' },
];

export default function AdminMapScreen() {
    const [activeTab, setActiveTab] = useState('all');
    const [mapType, setMapType] = useState('orders');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

    const { data: orders, isLoading: isLoadingOrders }: any = useQuery({
        queryKey: ['admin-map-orders', activeTab],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>('/admin/map', {
                params: { status: activeTab },
            });
            return response.data || [];
        },
        enabled: mapType === 'orders' || mapType === 'both',
    });

    const { data: drivers, isLoading: isLoadingDrivers }: any = useQuery({
        queryKey: ['admin-map-drivers'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>('/admin/map/drivers');
            return response.data || [];
        },
        enabled: mapType === 'drivers' || mapType === 'both',
    });

    const isLoading = isLoadingOrders || isLoadingDrivers;

    // Filter orders with valid coordinates
    const ordersWithLocation = (mapType === 'orders' || mapType === 'both') ? (orders?.filter(
        (order: any) =>
            order.address?.lat &&
            order.address?.lng &&
            order.address.lat !== 0 &&
            order.address.lng !== 0
    ) || []) : [];

    // Filter drivers with valid coordinates
    const driversWithLocation = (mapType === 'drivers' || mapType === 'both') ? (drivers?.filter(
        (driver: any) =>
            driver.lat &&
            driver.lng &&
            driver.lat !== 0 &&
            driver.lng !== 0
    ) || []) : [];

    // Calculate map region to show all orders and drivers
    const getMapRegion = () => {
        const allPoints = [
            ...ordersWithLocation.map((o: any) => ({ lat: o.address!.lat!, lng: o.address!.lng! })),
            ...driversWithLocation.map((d: any) => ({ lat: d.lat, lng: d.lng })),
        ];

        if (allPoints.length === 0) {
            return {
                latitude: 36.0156, // Maarat Misrin default
                longitude: 36.6731,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };
        }

        const lats = allPoints.map((p) => p.lat);
        const lngs = allPoints.map((p) => p.lng);

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
                <Header
                    title="خريطة الطلبات والسائقين"
                    description={`${ordersWithLocation.length} طلب، ${driversWithLocation.length} سائق`}
                />
                <View className="mt-4 mb-3">
                    <Tabs tabs={MAP_TYPE_TABS} activeTab={mapType} onTabChange={setMapType} />
                </View>
                {(mapType === 'orders' || mapType === 'both') && (
                    <View className="mt-3">
                        <Tabs tabs={ORDER_STATUS_TABS} activeTab={activeTab} onTabChange={setActiveTab} scrollable={true} />
                    </View>
                )}
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
                        {/* Order Markers */}
                        {ordersWithLocation.map((order: any) => {
                            const color = getStatusColor(order.status);
                            return (
                                <Marker
                                    key={`order-${order.id}`}
                                    coordinate={{
                                        latitude: order.address!.lat!,
                                        longitude: order.address!.lng!,
                                    }}
                                    onPress={() => {
                                        setSelectedOrder(order);
                                        setSelectedDriver(null);
                                    }}
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
                        {/* Driver Markers */}
                        {driversWithLocation.map((driver: any) => {
                            const driverColor = driver.status === 'available' ? '#16a34a' :
                                driver.status === 'busy' ? '#d97706' : '#6b7280';
                            return (
                                <Marker
                                    key={`driver-${driver.id}`}
                                    coordinate={{
                                        latitude: driver.lat,
                                        longitude: driver.lng,
                                    }}
                                    onPress={() => {
                                        setSelectedDriver(driver);
                                        setSelectedOrder(null);
                                    }}
                                >
                                    <View className="items-center">
                                        <View
                                            className="w-10 h-10 rounded-full items-center justify-center border-2 border-white"
                                            style={{ backgroundColor: driverColor }}
                                        >
                                            <Ionicons name="car" size={20} color="#ffffff" />
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

                    {selectedDriver && (
                        <Animated.View
                            entering={FadeInDown.duration(300)}
                            className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg"
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 text-start mb-1">
                                        {selectedDriver.name || 'سائق'}
                                    </Text>
                                    <Text className="text-sm text-gray-600 text-start mb-2">
                                        {selectedDriver.phone}
                                    </Text>
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{
                                                backgroundColor: selectedDriver.status === 'available' ? '#16a34a20' :
                                                    selectedDriver.status === 'busy' ? '#d9770620' : '#6b728020'
                                            }}
                                        >
                                            <Text
                                                className="text-xs font-semibold"
                                                style={{
                                                    color: selectedDriver.status === 'available' ? '#16a34a' :
                                                        selectedDriver.status === 'busy' ? '#d97706' : '#6b7280'
                                                }}
                                            >
                                                {selectedDriver.status === 'available' ? 'متاح' :
                                                    selectedDriver.status === 'busy' ? 'مشغول' : 'غير متاح'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedDriver(null)}>
                                    <Ionicons name="close" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                className="mt-3 bg-primary-600 rounded-lg py-2 px-4"
                                onPress={() => {
                                    router.push(`/(admin)/users/${selectedDriver.id}` as any);
                                }}
                            >
                                <Text className="text-white font-semibold text-center">عرض التفاصيل</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {ordersWithLocation.length === 0 && driversWithLocation.length === 0 && (
                        <View className="absolute inset-0 items-center justify-center bg-white/80">
                            <Ionicons name="map-outline" size={64} color="#d1d5db" />
                            <Text className="text-gray-500 text-right mt-4">لا توجد بيانات على الخريطة</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

