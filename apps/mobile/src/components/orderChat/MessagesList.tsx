import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Message } from '@/types/message.types';
import MessageBubble from './MessageBubble';
import { useEffect, useRef } from 'react';
import { Order } from '@/types/order.types';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  isLoading: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
  order?: Order;
}

export default function MessagesList({ messages, currentUserId, isLoading, scrollViewRef, order }: MessagesListProps) {
  const internalScrollRef = useRef<ScrollView>(null);
  const scrollRef = scrollViewRef || internalScrollRef;

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, scrollRef]);

  if (isLoading && messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollRef}
      className="flex-1 px-4 py-4 pb-8 " 
      showsVerticalScrollIndicator={false} 
      style={{ direction: 'rtl' }}
      onContentSizeChange={() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }}
    >
      {messages.map((message, index) => {
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isMyMessage={message.from_user === currentUserId}
            index={index}
            order={order}
          />
        );
      })}
      {messages.length === 0 && !isLoading && (
        <Animated.View entering={FadeInDown.duration(600)} className="items-center py-12">
          <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-start">ما عندك رسائل حالياً</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

