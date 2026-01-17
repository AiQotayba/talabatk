import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order, Message } from '@/types/order.types';
import { setCurrentOrder, updateOrder } from '@/store/slices/orders.slice';
import { setMessages, addMessage } from '@/store/slices/messages.slice';
import { OrderChatRole } from '../types';
import { uploadImages } from '@/utils/imageUpload';

interface UseOrderChatProps {
    orderId: string;
    role: OrderChatRole;
}

export const useOrderChat = ({ orderId, role }: UseOrderChatProps) => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const { user } = useAppSelector((state) => state.auth);
    const { messages } = useAppSelector((state) => state.messages);
    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => apiClient.get(`/orders/${orderId}`).then(r => r.data),
        enabled: !!orderId,
        refetchInterval: 10000, // تحديث كل 5 ثواني
        staleTime: 20000, // اعتبر الداتا جديدة 4 ثواني فقط
    });

    // Fetch messages
    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', orderId],
        queryFn: async () => {
            const response = await apiClient.get<Message[]>(`/messages/order/${orderId}`);
            return response.data || [];
        },
        enabled: !!orderId,
        // refetchInterval: 10000, // تحديث كل 5 ثواني
        // staleTime: 20000, // اعتبر الداتا جديدة 4 ثواني فقط
    });

    // Update Redux store
    useEffect(() => {
        if (order) {
            dispatch(setCurrentOrder(order));
        }
    }, [order, dispatch]);

    useEffect(() => {
        if (messagesData) {
            dispatch(setMessages({ orderId, messages: messagesData as any[] }));
        }
    }, [messagesData, orderId, dispatch]);

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ content, attachments }: { content: string; attachments?: string[] }) => {
            let uploadedUrls: string[] = [];

            // Upload images if attachments are provided
            if (attachments && attachments.length > 0) {
                const filesToUpload = attachments.filter(uri => uri.startsWith('file://'));
                const existingUrls = attachments.filter(uri => !uri.startsWith('file://'));

                // Add existing URLs
                uploadedUrls = [...existingUrls];

                // Upload local files using the new storage API
                if (filesToUpload.length > 0) {
                    try {
                        const urls = await uploadImages(filesToUpload, 'messages');
                        if (urls.length > 0) {
                            uploadedUrls = [...uploadedUrls, ...urls];
                        } else {
                            console.warn('No URLs returned from upload');
                        }
                    } catch (error: any) {
                        console.error('Failed to upload images:', error);
                        // Don't throw, allow message to be sent without images
                        console.warn('Continuing without uploaded images');
                    }
                }
            }

            // Send message with uploaded URLs
            const response = await apiClient.post<Message>('/messages', {
                order_id: orderId,
                content,
                message_type: uploadedUrls.length > 0 ? 'image' : 'text',
                attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
            });
            return response.data;
        },
        onSuccess: (newMessage) => {
            dispatch(addMessage({ orderId, message: newMessage! as any }));
            queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
        },
    });

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const response = await apiClient.put(`/orders/${orderId}/status`, { status });
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            dispatch(updateOrder(updatedOrder));
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        },
    });

    // Update order address mutation
    const updateAddressMutation = useMutation({
        mutationFn: async (addressId: string) => {
            const response = await apiClient.put(`/orders/${orderId}/address`, {
                dropoff_address_id: addressId,
            });
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            dispatch(updateOrder(updatedOrder));
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        },
    });

    // Reactivate order mutation
    const reactivateOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post(`/orders/${orderId}/reactivate`);
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            dispatch(updateOrder(updatedOrder));
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
        },
    });

    // Update order content mutation (admin only)
    const updateContentMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await apiClient.put(`/orders/${orderId}/content`, { content });
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            dispatch(updateOrder(updatedOrder));
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
        },
    });

    // Update order price mutation (admin only)
    const updatePriceMutation = useMutation({
        mutationFn: async (price: number) => {
            const response = await apiClient.put(`/orders/${orderId}/price`, { price });
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            dispatch(updateOrder(updatedOrder));
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
        },
    });

    const orderMessages = messages[orderId] || [];

    return {
        order,
        messages: orderMessages,
        isLoading: orderLoading || messagesLoading,
        isSending: sendMessageMutation.isPending,
        currentUserId: user?.id,
        role,
        sendMessage: (content: string, attachments?: string[]) => sendMessageMutation.mutate({ content, attachments }),
        updateOrderStatus: (status: string) => updateStatusMutation.mutate(status),
        updateOrderAddress: (addressId: string) => updateAddressMutation.mutate(addressId),
        reactivateOrder: () => reactivateOrderMutation.mutate(),
        updateOrderContent: (content: string) => updateContentMutation.mutate(content),
        updateOrderPrice: (price: number) => updatePriceMutation.mutate(price),
    };
};

