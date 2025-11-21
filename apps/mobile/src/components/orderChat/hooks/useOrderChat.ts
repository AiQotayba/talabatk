import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order, Message } from '@/types/order.types';
import { setCurrentOrder, updateOrder } from '@/store/slices/orders.slice';
import { setMessages, addMessage } from '@/store/slices/messages.slice';
import { OrderChatRole } from '../types';

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
        refetchInterval: 5000, // تحديث كل 5 ثواني
        staleTime: 4000, // اعتبر الداتا جديدة 4 ثواني فقط
    });

    // Fetch messages
    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', orderId],
        queryFn: async () => {
            const response = await apiClient.get<Message[]>(`/messages/order/${orderId}`);
            return response.data || [];
        },
        enabled: !!orderId,
        refetchInterval: 5000, // تحديث كل 5 ثواني
        staleTime: 4000, // اعتبر الداتا جديدة 4 ثواني فقط
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

                // Upload local files
                if (filesToUpload.length > 0) {
                    const formData = new FormData();
                    filesToUpload.forEach((uri, index) => {
                        const filename = uri.split('/').pop() || `image_${index}.jpg`;
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : 'image/jpeg';

                        formData.append('message_images', {
                            uri,
                            type,
                            name: filename,
                        } as any);
                    });

                    try {
                        const uploadResponse = await apiClient.uploadFile<{ urls: string[] }>('/messages/upload-images', formData);
                        // API returns { data: { urls: [...] } }
                        const urls = (uploadResponse as any).data?.urls || [];
                        if (urls.length > 0) {
                            uploadedUrls = [...uploadedUrls, ...urls];
                        }
                    } catch (error) {
                        console.error('Failed to upload images:', error);
                        throw error;
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
    };
};

