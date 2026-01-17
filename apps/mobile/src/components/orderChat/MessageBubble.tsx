import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Message } from '@/types/message.types';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/utils/constants';
import { Order } from '@/types/order.types';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  index: number;
  order?: Order;
}

export default function MessageBubble({ message, order, isMyMessage, index }: MessageBubbleProps) {
  const isSystemMessage = message.message_type === 'system';
  // Get sender name from from or from_user_data
  const senderName = message.from?.name || message.from_user_data?.name || 'مستخدم';
  const hasImage = message.attachments && message.attachments.length > 0;

  // Render system messages differently
  if (isSystemMessage) {
    console.log(message);

    return (
      <Animated.View
        entering={FadeInDown.duration(300).delay(index * 50)}
        className="mb-4 items-center"
      >
        <View className="bg-gray-100 rounded-3xl px-4 py-2 max-w-[80%]">
          <View className="flex-row items-center gap-2">
            <Ionicons name="information-circle" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-xs text-center text-wrap max-w-[80%]">{message.content || ''}</Text>
          </View>
          {message.content.includes('تم تحديث محتوى الطلب') &&
            order && <Text className="text-gray-600 text-xs text-center bg-gray-50 rounded-3xl p-2 my-2 ">{order.content || ''}</Text>}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 50)}
      className={`mb-4 ${isMyMessage ? 'items-end' : 'items-start'}`}
    >
      {!isMyMessage && (
        <Text className="text-xs text-gray-500 mb-1 px-2" style={{ textAlign: 'right' }}>
          {senderName || ''}
        </Text>
      )}
      <View
        className={`max-w-[80%] rounded-xl px-4 py-3 ${isMyMessage ? 'bg-primary-600' : 'bg-gray-200'}`}
        style={{
          minWidth: hasImage ? 200 : 150,
          shadowColor: isMyMessage ? '#E02020' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {hasImage && message.attachments && message.attachments.length > 0 && (
          <View className="mb-2">
            {message.attachments.map((attachment, idx) => {
              if (!attachment) return null;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    // Open image in full screen or external viewer
                    if (attachment && (attachment.startsWith('http') || attachment.startsWith('/uploads'))) {
                      const fullUrl = attachment.startsWith('/uploads')
                        ? `${API_BASE_URL.replace('/api', '')}${attachment}`
                        : attachment;
                      Linking.openURL(fullUrl);
                    }
                  }}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{
                      uri: attachment.startsWith('/uploads')
                        ? `${API_BASE_URL.replace('/api', '')}${attachment}`
                        : attachment
                    }}
                    className="w-full rounded-lg"
                    style={{ height: 200, resizeMode: 'cover' }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {message.content && (
          <Text
            className={`text-base leading-6 ${isMyMessage ? 'text-white' : 'text-gray-900'} ${isMyMessage ? 'text-right' : 'text-left'}`}
          >
            {message.content || ''}
          </Text>
        )}
        <Text
          className={`text-xs mt-2 ${isMyMessage ? 'text-primary-100' : 'text-gray-500'}`}
          style={{ textAlign: 'right' }}
        >
          {message.created_at ? new Date(message.created_at).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          }) : ''}
        </Text>
      </View>
    </Animated.View>
  );
}

