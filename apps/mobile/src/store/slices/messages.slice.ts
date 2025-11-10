import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '@/types/message.types';

interface MessagesState {
  messages: Record<string, Message[]>; // orderId -> messages
  unreadCount: number;
  typingIndicators: Record<string, boolean>; // orderId -> isTyping
}

const initialState: MessagesState = {
  messages: {},
  unreadCount: 0,
  typingIndicators: {},
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<{ orderId: string; messages: Message[] }>) => {
      const { orderId, messages } = action.payload;
      state.messages[orderId] = messages;
    },
    addMessage: (state, action: PayloadAction<{ orderId: string; message: Message }>) => {
      const { orderId, message } = action.payload;
      if (!state.messages[orderId]) {
        state.messages[orderId] = [];
      }
      state.messages[orderId].push(message);
      if (!message.is_read) {
        state.unreadCount += 1;
      }
    },
    markMessageAsRead: (state, action: PayloadAction<{ orderId: string; messageId: string }>) => {
      const { orderId, messageId } = action.payload;
      const messages = state.messages[orderId];
      if (messages) {
        const message = messages.find((m) => m.id === messageId);
        if (message && !message.is_read) {
          message.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    setTypingIndicator: (state, action: PayloadAction<{ orderId: string; isTyping: boolean }>) => {
      const { orderId, isTyping } = action.payload;
      state.typingIndicators[orderId] = isTyping;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearMessages: (state) => {
      state.messages = {};
      state.unreadCount = 0;
      state.typingIndicators = {};
    },
  },
});

export const {
  setMessages,
  addMessage,
  markMessageAsRead,
  setTypingIndicator,
  setUnreadCount,
  clearMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;


