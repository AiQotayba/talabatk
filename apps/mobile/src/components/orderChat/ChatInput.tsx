import { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ReadyMessages from './ReadyMessages';

interface ChatInputProps {
  onSend: (message: string, attachments?: string[]) => void;
  isSending?: boolean;
  disabled?: boolean;
  role?: 'client' | 'driver' | 'admin';
  showReadyMessages?: boolean;
}

export default function ChatInput({ 
  onSend, 
  isSending = false, 
  disabled = false,
  role = 'client',
  showReadyMessages = false,
}: ChatInputProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReadyMessagesList, setShowReadyMessagesList] = useState(false);

  const handleSend = () => {
    if ((messageText.trim() || selectedImage) && !isSending && !disabled) {
      const attachments = selectedImage ? [selectedImage] : undefined;
      onSend(messageText.trim(), attachments);
      setMessageText('');
      setSelectedImage(null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // @ts-ignore - MediaTypeOptions is deprecated but still works in this version
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى الكاميرا');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'اختر صورة',
      '',
      [
        { text: 'الكاميرا', onPress: takePhoto },
        { text: 'المعرض', onPress: pickImage },
        { text: 'إلغاء', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSelectReadyMessage = (message: string) => {
    setMessageText(message);
    setShowReadyMessagesList(false);
  };

  return (
    <>
      {showReadyMessages && role === 'driver' && (
        <ReadyMessages 
          onSelectMessage={handleSelectReadyMessage}
          visible={showReadyMessagesList}
        />
      )}
      <View 
        className="bg-white border-t border-gray-200 px-4 py-3"
        style={{ 
          direction: 'rtl',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        {selectedImage && (
          <View className="mb-2 relative">
            <Image source={{ uri: selectedImage }} className="w-20 h-20 rounded-lg" />
            <TouchableOpacity
              className="absolute top-0 left-0 bg-red-500 rounded-full p-1"
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        <View className="flex-row items-end gap-2">
          {role === 'driver' && showReadyMessages && (
            <TouchableOpacity
              className="bg-primary-100 rounded-xl px-3 py-3"
              onPress={() => setShowReadyMessagesList(!showReadyMessagesList)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles" size={22} color="#E02020" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-3 py-3"
            onPress={showImageOptions}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={22} color="#6b7280" />
          </TouchableOpacity>
          
          <TextInput
            className="flex-1 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="اكتب رسالة..."
            placeholderTextColor="#9ca3af"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            editable={!disabled}
            style={{ textAlign: 'right', minHeight: 44, maxHeight: 100 }}
          />
          
          <TouchableOpacity
            className="bg-primary-600 rounded-xl px-4 py-3"
            onPress={handleSend}
            disabled={(!messageText.trim() && !selectedImage) || isSending || disabled}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              opacity: (!messageText.trim() && !selectedImage) || isSending || disabled ? 0.5 : 1,
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
    </>
  );
}

