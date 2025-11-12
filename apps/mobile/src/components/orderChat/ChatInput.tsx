import { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (message: string) => void;
  isSending?: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isSending = false, disabled = false }: ChatInputProps) {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim() && !isSending && !disabled) {
      onSend(messageText.trim());
      setMessageText('');
    }
  };

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-2" style={{ direction: 'rtl' }}>
      <View className="flex-row items-center gap-2">
        <TextInput
          className="flex-1 rounded-xl px-4 py-3 text-base bg-gray-50"
          placeholder="اكتب رسالة..."
          placeholderTextColor="#9ca3af"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          editable={!disabled}
          style={{ textAlign: 'right', minHeight: 44 }}
        />
        <TouchableOpacity
          className="bg-primary-600 rounded-xl px-4 py-3"
          onPress={handleSend}
          disabled={!messageText.trim() || isSending || disabled}
          activeOpacity={0.8}
          style={{
            shadowColor: '#E02020',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {isSending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="send" size={22} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

