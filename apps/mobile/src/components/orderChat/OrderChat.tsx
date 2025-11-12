import { useState } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderChatProps } from './types';
import { useOrderChat } from './hooks/useOrderChat';
import OrderChatHeader from './OrderChatHeader';
import OrderDetails from './OrderDetails';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import OrderActionsMenu from './OrderActionsMenu';

export default function OrderChat({ orderId, role, onBack, onAction }: OrderChatProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { order, messages, isLoading, isSending, currentUserId, sendMessage, updateOrderStatus } = useOrderChat({
    orderId,
    role,
  });

  const handleCancel = () => {
    Alert.alert('إلغاء الطلب', 'هل أنت متأكد من إلغاء هذا الطلب؟', [
      { text: 'لا', style: 'cancel' },
      { text: 'نعم', onPress: () => updateOrderStatus('cancelled') },
    ]);
  };

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId, { orderId, order });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white" style={{ direction: 'rtl' }}>
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white mt-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <OrderChatHeader
        order={order}
        role={role}
        onBack={onBack || (() => {})}
        onMenuPress={() => setIsMenuOpen(true)}
      />

      <OrderDetails order={order} role={role} />

      <MessagesList messages={messages} currentUserId={currentUserId} isLoading={isLoading} />

      <ChatInput onSend={sendMessage} isSending={isSending} />

      <OrderActionsMenu
        visible={isMenuOpen}
        order={order}
        role={role}
        onClose={() => setIsMenuOpen(false)}
        onCancel={handleCancel}
        onRate={() => handleAction('rate')}
        onComplaint={() => handleAction('complaint')}
        onAccept={() => handleAction('accept')}
        onReject={() => handleAction('reject')}
        onUpdateStatus={(status) => handleAction(status)}
      />
    </KeyboardAvoidingView>
  );
}

