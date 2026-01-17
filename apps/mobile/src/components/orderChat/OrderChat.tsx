import { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderChatProps } from './types';
import { useOrderChat } from './hooks/useOrderChat';
import OrderChatHeader from './OrderChatHeader';
import OrderDetails from './OrderDetails';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import OrderActionsMenu from './OrderActionsMenu';
import { Toast } from '@/utils/toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

export default function OrderChat({ orderId, role, onBack, onAction }: OrderChatProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const { showDialog, DialogComponent } = useConfirmDialog();
  const { order, messages, isLoading, isSending, currentUserId, sendMessage, updateOrderStatus, updateOrderAddress, reactivateOrder, updateOrderContent, updateOrderPrice } = useOrderChat({
    orderId,
    role,
  });

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleCancel = () => {
    showDialog({
      title: 'إلغاء الطلب',
      message: 'هل أنت متأكد من إلغاء هذا الطلب؟',
      type: 'danger',
      onConfirm: () => updateOrderStatus('cancelled'),
    });
  };

  const handleAction = (actionId: string) => {
    if (onAction) {
      onAction(actionId, { orderId, order });
    }
  };

  const handleUpdateAddress = () => {
    if (onAction) {
      onAction('update_address', { orderId, order });
    }
  };

  const handleReorder = () => {
    showDialog({
      title: 'إعادة تفعيل الطلب',
      message: 'هل أنت متأكد من إعادة تفعيل هذا الطلب؟',
      type: 'info',
      onConfirm: () => reactivateOrder(),
    });
  };

  const handleUpdateContent = () => {
    if (onAction) {
      onAction('update_content', { orderId, order });
    }
  };

  const handleUpdatePrice = () => {
    if (onAction) {
      onAction('update_price', { orderId, order });
    }
  };

  const handleCreateFeatured = () => {
    if (onAction) {
      onAction('create_featured', { orderId, order });
    }
  };

  const handleShowQRCode = () => {
    if (onAction) {
      onAction('show_qr_code', { orderId, order });
    }
  };

  const handleScanQRCode = () => {
    if (onAction) {
      onAction('scan_qr_code', { orderId, order });
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
        onBack={onBack || (() => { })}
        onMenuPress={() => setIsMenuOpen(true)}
      />

      <OrderDetails order={order} role={role} />

      <MessagesList 
        messages={messages} 
        order={order}
        currentUserId={currentUserId} 
        isLoading={isLoading}
        scrollViewRef={scrollViewRef}
      />

      <ChatInput
        onSend={(content, attachments) => {
          sendMessage(content, attachments);
        }}
        isSending={isSending}
        role={role}
        showReadyMessages={role === 'driver'}
      />

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
        onUpdateAddress={handleUpdateAddress}
        onReorder={handleReorder}
        onUpdateContent={handleUpdateContent}
        onUpdatePrice={handleUpdatePrice}
        onCreateFeatured={handleCreateFeatured}
        onShowQRCode={handleShowQRCode}
        onScanQRCode={handleScanQRCode}
      />

      <DialogComponent />
    </KeyboardAvoidingView>
  );
}

