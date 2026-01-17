import { ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import Header from '@/components/ui/header';
import OrderGrid from '@/components/orders/order-grid';

export default function DriverOrdersScreen() {

    const { data: orders, isLoading, refetch } = useQuery({
        queryKey: ['driver-orders'],
        queryFn: async () => {
            const response = await apiClient.get<Order[]>('/orders/driver/history');
            return response.data || [];
        },
    });

    return (
        <ScrollView
            className="flex-1 bg-gray-50 py-6"
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            showsVerticalScrollIndicator={false}
            style={{ direction: 'rtl' }}
        >
            <Header title="طلباتي" description="جميع الطلبات المكلف بها" />

            <OrderGrid orders={orders || []} isLoading={isLoading} role="driver" />
        </ScrollView>
    );
}