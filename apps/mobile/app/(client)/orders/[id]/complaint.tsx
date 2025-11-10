import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/services/api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ComplaintScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('طلب مرفوض', 'يجب منح إذن الوصول للصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const submitComplaintMutation = useMutation({
    mutationFn: async (data: { description: string; photo_urls?: string[] }) => {
      // TODO: Upload photos first, then submit complaint with URLs
      const response = await apiClient.post('/complaints', {
        order_id: id,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      Alert.alert('نجح', 'تم إرسال الشكوى بنجاح');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message || 'فشل إرسال الشكوى');
    },
  });

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('مطلوب', 'الرجاء وصف المشكلة');
      return;
    }
    submitComplaintMutation.mutate({
      description: description.trim(),
      photo_urls: photos.length > 0 ? photos : undefined,
    });
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} style={{ direction: 'rtl' }}>
      <View className="px-6 py-8">
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="items-center mb-8">
            <View className="bg-error-100 rounded-full p-4 w-20 h-20 items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={40} color="#dc2626" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">إرسال شكوى</Text>
            <Text className="text-gray-600 text-base text-center leading-6">
              اكتب المشكلة اللي واجهتها مع الطلب
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2 text-right">الوصف *</Text>
            <TextInput
              className="border-2 border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50"
              placeholder="اكتب عن المشكلة..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
              style={{ textAlign: 'right', minHeight: 120 }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-3 text-right">صور (اختياري)</Text>
            <View className="flex-row flex-wrap gap-3" style={{ flexDirection: 'row-reverse' }}>
              {photos.map((photo, index) => (
                <Animated.View key={index} entering={FadeInDown.duration(300)} className="relative">
                  <Image source={{ uri: photo }} className="w-24 h-24 rounded-xl" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-error-600 rounded-full p-1.5"
                    onPress={() => removePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={28} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            <Text className="text-xs text-gray-500 mt-3 text-right">
              يمكنك إضافة حتى 5 صور
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4"
            onPress={handleSubmit}
            disabled={submitComplaintMutation.isPending || !description.trim()}
            activeOpacity={0.8}
            style={{
              shadowColor: '#E02020',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity: !description.trim() ? 0.5 : 1,
            }}
          >
            {submitComplaintMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center gap-2" style={{ flexDirection: 'row-reverse' }}>
                <Ionicons name="send" size={20} color="#ffffff" />
                <Text className="text-white text-center font-bold text-base">
                  إرسال الشكوى
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}


