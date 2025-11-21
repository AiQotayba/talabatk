import { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order, OrderStatus } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DriverStatusCard, { DriverStatus } from '@/components/driver/DriverStatusCard';
import PendingOrderCard from '@/components/driver/PendingOrderCard';
import { useToast } from '@/contexts/ToastContext';
import Header from '@/components/ui/header';
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
    const { showSuccess, showError } = useToast();

    // Get driver status (default to available)
    const [driverStatus, setDriverStatus] = useState<DriverStatus>('available');
    const [orderFilter, setOrderFilter] = useState<string>('all');

    // Fetch pending orders
    const { data: pendingOrders, isLoading, refetch } = useQuery({
        queryKey: ['driver-pending-orders'],
        queryFn: async () => {
            const response = await apiClient.get<Order[]>('/orders/driver/pending');
            return response.data || [];
        },
        enabled: driverStatus === 'available',
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    // Filter orders based on selected filter
    const filteredOrders = pendingOrders?.filter((order) => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'pending') return order.status === 'pending';
        if (orderFilter === 'assigned') return order.status === 'assigned';
        return true;
    }) || [];

    // Fetch driver stats
    const { data: driverOrders } = useQuery({
        queryKey: ['driver-orders'],
        queryFn: async () => {
            const response = await apiClient.get<Order[]>('/orders/driver/history');
            return response.data || [];
        },
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
        },
    });

    // Accept order mutation
    const acceptOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await apiClient.post(`/orders/${orderId}/accept`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            showSuccess('تم قبول الطلب بنجاح');
            if (acceptOrderMutation.variables) {
                router.push(`/(driver)/orders/${acceptOrderMutation.variables}` as any);
            }
        },
        onError: (error: any) => {
            showError(error.message || 'فشل قبول الطلب');
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
            showSuccess('تم رفض الطلب');
        },
        onError: (error: any) => {
            showError(error.message || 'فشل رفض الطلب');
        },
    });

    const handleStatusChange = (status: DriverStatus) => {
        updateStatusMutation.mutate(status);
    };

    const handleAcceptOrder = (orderId: string) => {
        acceptOrderMutation.mutate(orderId);
    };

    const handleRejectOrder = (orderId: string) => {
        rejectOrderMutation.mutate(orderId);
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50 mt-8"
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
            style={{ direction: 'rtl' }}
        >
            <Header title={`أهلاً بك، ${user?.name}`} description="جاهز للعمل اليوم؟" />

            <View className="px-6 mt-4" style={{ direction: 'rtl' }}>
                <DriverStatusCard
                    currentStatus={driverStatus}
                    onStatusChange={handleStatusChange}
                    isLoading={updateStatusMutation.isPending}
                />

                {driverStatus === 'available' && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-900 text-right">الطلبات المعلقة</Text>
                            {filteredOrders && filteredOrders.length > 0 && (
                                <View className="bg-primary-100 px-3 py-1 rounded-full">
                                    <Text className="text-primary-600 font-bold text-sm">{filteredOrders.length}</Text>
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
                        ) : filteredOrders && filteredOrders.length > 0 ? (
                            filteredOrders.slice(0, 3).map((order, index) => (
                                <PendingOrderCard
                                    key={order.id}
                                    order={order}
                                    index={index}
                                    onAccept={handleAcceptOrder}
                                    onReject={handleRejectOrder}
                                />
                            ))
                        ) : (
                            <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
                                <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
                                <Text className="text-gray-500 text-right mt-4">لا توجد طلبات معلقة حالياً</Text>
                                <Text className="text-gray-400 text-sm text-right mt-2">ستظهر الطلبات الجديدة هنا</Text>
                            </Animated.View>
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

