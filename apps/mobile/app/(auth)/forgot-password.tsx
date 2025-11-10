import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement forgot password API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSent(true);
      Alert.alert('تم الإرسال', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error: any) {
      Alert.alert('خطأ', error || 'حدث خطأ أثناء إرسال البريد الإلكتروني');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <View className="flex-1 bg-white px-6 justify-center items-center" style={{ direction: 'rtl' }}>
        <Animated.View
          entering={FadeInDown.duration(600)}
          className="items-center"
        >
          <View className="bg-success-100 rounded-full p-6 mb-6">
            <Ionicons name="mail" size={48} color="#16a34a" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            تم الإرسال بنجاح
          </Text>
          <Text className="text-gray-600 text-base text-center mb-8 leading-6 px-4">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
          </Text>
          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4 px-8"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center" style={{ direction: 'rtl' }}>
      <Animated.View entering={FadeInDown.duration(600)}>
        <View className="mb-10">
          <View className="bg-primary-100 rounded-full mx-auto p-4 w-20 h-20 items-center justify-center mb-6 self-center">
            <Ionicons name="lock-closed" size={40} color="#E02020" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">نسيت كلمة المرور؟</Text>
          <Text className="text-gray-600 text-base text-center leading-6">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">البريد الإلكتروني</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-4 text-base bg-gray-50"
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#9ca3af"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ textAlign: 'right', direction: 'ltr' }}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm mt-2 text-start">{errors.email.message}</Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 mb-6"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          activeOpacity={0.8}
          style={{
            shadowColor: '#E02020',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-base">إرسال رابط إعادة التعيين</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center"
        >
          <Text className="text-primary-600 font-medium text-base">العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}


