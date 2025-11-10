import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/api/apiClient';
import { Order } from '@/types/order.types';
import { Message } from '@/types/message.types';
import { setCurrentOrder, updateOrder } from '@/store/slices/orders.slice';
import { setMessages, addMessage } from '@/store/slices/messages.slice';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    assigned: 'تم التعيين',
    in_progress: 'قيد التنفيذ',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    failed: 'فشل',
  };
  return statusMap[status] || status;
};

export default function OrderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const { messages } = useAppSelector((state) => state.messages);
  const [messageText, setMessageText] = useState('');

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await apiClient.get<Message[]>(`/messages/order/${id}`);
      return response.data || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order) {
      dispatch(setCurrentOrder(order));
    }
  }, [order, dispatch]);

  useEffect(() => {
    if (messagesData) {
      dispatch(setMessages({ orderId: id!, messages: messagesData }));
    }
  }, [messagesData, id, dispatch]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiClient.post<Message>('/messages', {
        order_id: id,
        content,
        message_type: 'text',
      });
      return response.data;
    },
    onSuccess: (newMessage) => {
      dispatch(addMessage({ orderId: id!, message: newMessage }));
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setMessageText('');
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إرسال الرسالة');
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.put(`/orders/${id}/status`, {
        status: 'cancelled',
      });
      return response.data;
    },
    onSuccess: (updatedOrder) => {
      dispatch(updateOrder(updatedOrder));
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      Alert.alert('نجح', 'تم إلغاء الطلب بنجاح');
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إلغاء الطلب');
    },
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'إلغاء الطلب',
      'هل أنت متأكد من إلغاء هذا الطلب؟',
      [
        { text: 'لا', style: 'cancel' },
        { text: 'نعم', onPress: () => cancelOrderMutation.mutate() },
      ]
    );
  };

  const orderMessages = messages[id!] || [];

  if (orderLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <ActivityIndicator size="large" color="#E02020" />
        <Text className="text-gray-500 mt-4 text-right">جاري تحميل الطلب...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text className="text-gray-500 mt-4 text-right">الطلب غير موجود</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success-100 text-success-700';
      case 'cancelled':
        return 'bg-error-100 text-error-700';
      case 'pending':
      case 'assigned':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center justify-between" style={{ flexDirection: 'row-reverse' }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mr-4">
            <View className="flex-row items-center gap-2 mb-1" style={{ flexDirection: 'row-reverse' }}>
              <Ionicons name="receipt-outline" size={20} color="#E02020" />
              <Text className="font-bold text-gray-900 text-base">
                طلب #{order.id.slice(0, 8)}
              </Text>
            </View>
            <View className={`self-end px-3 py-1 rounded-lg ${getStatusColor(order.status)}`}>
              <Text className="text-xs font-semibold">{getStatusText(order.status)}</Text>
            </View>
          </View>
          {order.driver && (
            <View className="items-start">
              <Text className="text-xs text-gray-600 text-right">المندوب</Text>
              <Text className="font-bold text-gray-900 text-base text-right">{order.driver.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Order Details */}
      <View className="bg-gray-50 px-4 py-3 border-b border-gray-200" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center gap-2 mb-3" style={{ flexDirection: 'row-reverse' }}>
          <Ionicons name="information-circle-outline" size={20} color="#E02020" />
          <Text className="font-bold text-gray-900 text-base">تفاصيل الطلب</Text>
        </View>
        <Text className="text-gray-700 mb-3 text-right leading-6">{order.content}</Text>
        {order.dropoff_address && (
          <View className="flex-row items-start mt-2 mb-2" style={{ flexDirection: 'row-reverse' }}>
            <Ionicons name="location" size={18} color="#E02020" />
            <Text className="text-gray-700 text-sm mr-2 flex-1 text-right">
              {order.dropoff_address.street}, {order.dropoff_address.city}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-2" style={{ flexDirection: 'row-reverse' }}>
          <Ionicons name="card-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm">
            الدفع: {order.payment_method === 'cash' ? 'نقدي' : order.payment_method === 'card' ? 'بطاقة' : 'إلكتروني'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
        {orderMessages.map((message, index) => {
          const isMyMessage = message.from_user === user?.id;
          return (
            <Animated.View
              key={message.id}
              entering={FadeInDown.duration(300).delay(index * 50)}
              className={`mb-4 ${isMyMessage ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  isMyMessage ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{
                  shadowColor: isMyMessage ? '#E02020' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  className={`text-base leading-6 ${isMyMessage ? 'text-white' : 'text-gray-900'}`}
                  style={{ textAlign: 'right' }}
                >
                  {message.content}
                </Text>
                <Text
                  className={`text-xs mt-2 ${
                    isMyMessage ? 'text-primary-100' : 'text-gray-500'
                  }`}
                  style={{ textAlign: 'right' }}
                >
                  {new Date(message.created_at).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Animated.View>
          );
        })}
        {orderMessages.length === 0 && !messagesLoading && (
          <Animated.View entering={FadeInDown.duration(600)} className="items-center py-12">
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">ما عندك رسائل حالياً</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Order Actions */}
      <View className="bg-gray-50 px-4 py-3 border-t border-gray-200" style={{ direction: 'rtl' }}>
        <View className="flex-row gap-3" style={{ flexDirection: 'row-reverse' }}>
          {order.status === 'pending' && (
            <TouchableOpacity
              className="flex-1 bg-error-600 rounded-xl py-3"
              onPress={handleCancelOrder}
              activeOpacity={0.8}
              style={{
                shadowColor: '#dc2626',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                <Ionicons name="close-circle" size={18} color="#ffffff" />
                <Text className="text-white text-center font-bold text-base">إلغاء الطلب</Text>
              </View>
            </TouchableOpacity>
          )}
          {order.status === 'delivered' && (
            <TouchableOpacity
              className="flex-1 bg-primary-600 rounded-xl py-3"
              onPress={() => router.push(`/(client)/orders/${id}/rating`)}
              activeOpacity={0.8}
              style={{
                shadowColor: '#E02020',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                <Ionicons name="star" size={18} color="#ffffff" />
                <Text className="text-white text-center font-bold text-base">تقييم الطلب</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-warning-600 rounded-xl py-3"
            onPress={() => router.push(`/(client)/orders/${id}/complaint`)}
            activeOpacity={0.8}
            style={{
              shadowColor: '#d97706',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row-reverse' }}>
              <Ionicons name="alert-circle" size={18} color="#ffffff" />
              <Text className="text-white text-center font-bold text-base">شكوى</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message Input */}
      <View className="bg-white border-t border-gray-200 px-4 py-3" style={{ direction: 'rtl' }}>
        <View className="flex-row items-center gap-2" style={{ flexDirection: 'row-reverse' }}>
          <TextInput
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="اكتب رسالة..."
            placeholderTextColor="#9ca3af"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            style={{ textAlign: 'right', minHeight: 44 }}
          />
          <TouchableOpacity
            className="bg-primary-600 rounded-xl px-4 py-3"
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={22} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

