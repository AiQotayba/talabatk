import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Message } from '@/types/message.types';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  index: number;
}

export default function MessageBubble({ message, isMyMessage, index }: MessageBubbleProps) {
  // Get sender name from from or from_user_data
  const senderName = message.from?.name || message.from_user_data?.name || 'مستخدم';

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 50)}
      className={`mb-4 ${isMyMessage ? 'items-end' : 'items-start'}`}
    >
      {!isMyMessage && (
        <Text className="text-xs text-gray-500 mb-1 px-2" style={{ textAlign: 'right' }}>
          {senderName}
        </Text>
      )}
      <View
        className={`max-w-[80%] min-w-[150px] rounded-xl px-4 py-3 ${isMyMessage ? 'bg-primary-600' : 'bg-gray-200'}`}
        style={{
          minWidth: 250,
          shadowColor: isMyMessage ? '#E02020' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          className={`text-base leading-6 ${isMyMessage ? 'text-white' : 'text-gray-900'} ${isMyMessage ? 'text-right' : 'text-left'}`}
          style={{ minWidth: 250 }}
        >
          {message.content}
        </Text>
        <Text
          className={`text-xs mt-2 ${isMyMessage ? 'text-primary-100' : 'text-gray-500'}`}
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
}

