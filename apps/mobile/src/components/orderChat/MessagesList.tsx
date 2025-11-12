import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Message } from '@/types/message.types';
import MessageBubble from './MessageBubble';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading: boolean;
}

export default function MessagesList({ messages, currentUserId, isLoading }: MessagesListProps) {
  if (isLoading && messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }
  console.log(messages);
  return (
    <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isMyMessage={message.from_user === currentUserId}
          index={index}
        />
      ))}
      {messages.length === 0 && !isLoading && (
        <Animated.View entering={FadeInDown.duration(600)} className="items-center py-12">
          <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">ما عندك رسائل حالياً</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

