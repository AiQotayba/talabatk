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

    // Fetch order
    const { data: order, isLoading: orderLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await apiClient.get<Order>(`/orders/${orderId}`);
            return response.data;
        },
        enabled: !!orderId,
    });

    // Fetch messages
    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', orderId],
        queryFn: async () => {
            const response = await apiClient.get<Message[]>(`/messages/order/${orderId}`);
            return response.data || [];
        },
        enabled: !!orderId,
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
        mutationFn: async (content: string) => {
            const response = await apiClient.post<Message>('/messages', {
                order_id: orderId,
                content,
                message_type: 'text',
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
        sendMessage: (content: string) => sendMessageMutation.mutate(content),
        updateOrderStatus: (status: string) => updateStatusMutation.mutate(status),
    };
};

