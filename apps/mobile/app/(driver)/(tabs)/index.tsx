import { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DriverHeaderStatus, { DriverStatus } from '@/components/driver/DriverHeaderStatus';
import PendingOrderCard from '@/components/driver/PendingOrderCard';
import { Toast } from '@/utils/toast';
import Tabs, { TabItem } from '@/components/ui/tabs';

const ORDER_FILTER_TABS: TabItem[] = [
    { id: 'all', label: 'الكل', icon: 'list' },
    { id: 'pending', label: 'معلقة', icon: 'time' },
    { id: 'assigned', label: 'معينة', icon: 'person-add' },
];

export default function DriverDashboardScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAppSelector((state: any) => state.auth);

    // Get driver status (default to available)
    const [driverStatus, setDriverStatus] = useState<DriverStatus>('available');
    const [orderFilter, setOrderFilter] = useState<string>('all');

    // Fetch orders with filter
    const { data: ordersData, isLoading, refetch } = useQuery({
        queryKey: ['driver-orders', orderFilter],
        queryFn: async () => {
            const statusParam = orderFilter === 'all' ? 'all' : orderFilter;
            const response = await apiClient.get<Order[]>(`/orders/driver?status=${statusParam}`);
            // apiClient.get returns ApiResponse<T> which has { success, data, ... }
            // For paginated responses, data is the array directly
            // For non-paginated, data is also the array
            const orders = response.data || [];
            return Array.isArray(orders) ? orders : [];
        },
        enabled: driverStatus === 'available',
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    // Update driver status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status: DriverStatus) => {
            // TODO: Call API to update driver status
            // For now, just update local state
            return status;
        },
        onSuccess: (status) => {
            setDriverStatus(status);
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
        },
    });

    // Accept order mutation
    const acceptOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(`/orders/${orderId}/accept`);
            return response.data;
        },
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            Toast.success('تم القبول بنجاح', 'تم قبول الطلب بنجاح! يمكنك الآن البدء في التوصيل');
            router.push(`/(driver)/orders/${orderId}` as any);
        },
        onError: (error: any) => {
            Toast.error('فشل القبول', error.message || 'حدث خطأ أثناء قبول الطلب. يرجى المحاولة مرة أخرى');
        },
    });

    // Reject order mutation
    const rejectOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(`/orders/${orderId}/reject`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            Toast.success('تم الرفض', 'تم رفض الطلب بنجاح. سيتم إرساله لسائق آخر');
        },
        onError: (error: any) => {
            Toast.error('فشل الرفض', error.message || 'حدث خطأ أثناء رفض الطلب. يرجى المحاولة مرة أخرى');
        },
    });

    const handleStatusChange = (status: DriverStatus) => updateStatusMutation.mutate(status);

    const handleAcceptOrder = (orderId: string) => acceptOrderMutation.mutate(orderId);

    const handleRejectOrder = (orderId: string) => rejectOrderMutation.mutate(orderId);

    return (
        <ScrollView
            className="flex-1 bg-gray-50 mt-8"
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
            style={{ direction: 'rtl' }}
        >
            <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                <DriverHeaderStatus
                    userName={user?.name}
                    currentStatus={driverStatus}
                    onStatusChange={handleStatusChange}
                    isLoading={updateStatusMutation.isPending}
                />

                {driverStatus === 'available' && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-900 text-right">الطلبات المعلقة</Text>
                            {ordersData && ordersData.length > 0 && (
                                <View className="bg-primary-100 px-3 py-1 rounded-full">
                                    <Text className="text-primary-600 font-bold text-sm">{ordersData.length}</Text>
                                </View>
                            )}
                        </View>

                        <View className="mb-4">
                            <Tabs tabs={ORDER_FILTER_TABS} activeTab={orderFilter} onTabChange={setOrderFilter} />
                        </View>

                        {isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#E02020" />
                                <Text className="text-gray-500 mt-4 text-right">جاري التحميل...</Text>
                            </View>
                        ) : ordersData && ordersData.length > 0 ? (
                            <>
                                {ordersData.slice(0, 3).map((order, index) => (
                                    <PendingOrderCard
                                        key={order.id}
                                        order={order}
                                        index={index}
                                        onAccept={handleAcceptOrder}
                                        onReject={handleRejectOrder}
                                    />
                                ))}
                                {ordersData.length > 3 && (
                                    <TouchableOpacity
                                        className="mt-4 bg-primary-600 rounded-xl py-3 px-6 flex-row items-center justify-center gap-2"
                                        onPress={() => router.push('/(driver)/(tabs)/orders')}
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-bold text-base">عرض جميع الطلبات</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <PendingOrderCard
                                order={{} as Order}
                                index={0}
                                onAccept={() => { }}
                                onReject={() => { }}
                            />
                        )}
                    </View>
                )}

                {driverStatus !== 'available' && (
                    <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
                        <Ionicons name="information-circle-outline" size={64} color="#d1d5db" />
                        <Text className="text-gray-500 text-right mt-4">
                            قم بتفعيل حالة "متاح" لاستقبال الطلبات
                        </Text>
                    </Animated.View>
                )}
            </View>
        </ScrollView>
    );
}

