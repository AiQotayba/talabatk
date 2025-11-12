import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { OrderChat } from '@/components/orderChat';
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function DriverOrderChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    const [confirmDialog, setConfirmDialog] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    const acceptOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post(`/orders/${id}/accept`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            showSuccess('تم قبول الطلب بنجاح');
        },
        onError: (error: any) => {
            showError(error.message || 'فشل قبول الطلب');
        },
    });

    const rejectOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post(`/orders/${id}/reject`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver-pending-orders'] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            showSuccess('تم رفض الطلب');
            router.back();
        },
        onError: (error: any) => {
            showError(error.message || 'فشل رفض الطلب');
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const response = await apiClient.put(`/orders/${id}/status`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
            showSuccess('تم تحديث حالة الطلب بنجاح');
        },
        onError: (error: any) => {
            showError(error.message || 'فشل تحديث حالة الطلب');
        },
    });

    const showConfirmDialog = (
        title: string,
        message: string,
        type: 'danger' | 'warning' | 'info',
        onConfirm: () => void
    ) => {
        setConfirmDialog({
            visible: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const handleAction = (action: string, data?: any) => {
        switch (action) {
            case 'accept':
                showConfirmDialog(
                    'قبول الطلب',
                    'هل أنت متأكد من قبول هذا الطلب؟',
                    'info',
                    () => acceptOrderMutation.mutate()
                );
                break;
            case 'reject':
                showConfirmDialog(
                    'رفض الطلب',
                    'هل أنت متأكد من رفض هذا الطلب؟',
                    'warning',
                    () => rejectOrderMutation.mutate()
                );
                break;
            case 'picked_up':
                showConfirmDialog(
                    'تم الاستلام',
                    'هل أنت متأكد من تحديث الحالة إلى "تم الاستلام"؟',
                    'info',
                    () => updateStatusMutation.mutate('picked_up')
                );
                break;
            case 'in_transit':
                showConfirmDialog(
                    'في الطريق',
                    'هل أنت متأكد من تحديث الحالة إلى "في الطريق"؟',
                    'info',
                    () => updateStatusMutation.mutate('in_transit')
                );
                break;
            case 'delivered':
                showConfirmDialog(
                    'تم التسليم',
                    'هل أنت متأكد من تحديث الحالة إلى "تم التسليم"؟',
                    'info',
                    () => updateStatusMutation.mutate('delivered')
                );
                break;
            default:
                break;
        }
    };

    return (
        <>
            <OrderChat
                orderId={id!}
                role="driver"
                onBack={() => router.back()}
                onAction={handleAction}
            />
            <ConfirmDialog
                visible={confirmDialog.visible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                onConfirm={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog((prev) => ({ ...prev, visible: false }));
                }}
                onCancel={() => setConfirmDialog((prev) => ({ ...prev, visible: false }))}
                isLoading={
                    acceptOrderMutation.isPending ||
                    rejectOrderMutation.isPending ||
                    updateStatusMutation.isPending
                }
            />
        </>
    );
}

