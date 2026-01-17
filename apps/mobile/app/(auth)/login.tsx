import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/auth.slice';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Toast } from '@/utils/toast';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(login(data)).unwrap();

      // Navigate based on user role
      if (result.user.role === 'client') {
        router.replace(ROUTES.CLIENT_HOME);
      } else if (result.user.role === 'driver') {
        // @ts-ignore - Driver routes not yet implemented
        router.replace(ROUTES.DRIVER_HOME);
      } else if (result.user.role === 'admin') {
        // @ts-ignore - Admin routes not yet implemented
        router.replace(ROUTES.ADMIN_HOME);
      }
    } catch (error: any) {
      Toast.error('فشل تسجيل الدخول', error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const handleDefaultData = (role: string) => {
    if (role === 'admin') {
      setValue('email', 'ktsyr1@gmail.com');
      setValue('password', 'password123');
    } else if (role === 'driver') {
      setValue('email', 'driver@app.com');
      setValue('password', 'password123');
    } else if (role === 'client') {
      setValue('email', 'client@app.com');
      setValue('password', 'password123');
    };
  }
  return (
    <View className="flex-1 bg-white px-6 justify-center gap-4 grid grid-cols-1" style={{ direction: 'rtl' }}>
      <Animated.View entering={FadeInDown.duration(600)} className="col-span-1">
        <View className="items-center mb-6 col-span-1">
          <View className="bg-primary-100 rounded-full p-4 w-20 h-20 items-center justify-center mb-4">
            <Ionicons name="log-in" size={40} color="#E02020" />
          </View>
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2 text-start">أهلاً بك</Text>
        <Text className="text-gray-600 text-base text-start">سجل دخولك للمتابعة</Text>
      </Animated.View>

      <View className="col-span-1">
        <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">البريد الإلكتروني</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={{ marginLeft: 12 }} />
              <TextInput
                className="flex-1 px-4 py-4 text-base"
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#9ca3af"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ textAlign: 'right', direction: 'ltr' }}
              />
            </View>
          )}
        />
        {errors.email && (
          <Text className="text-red-500 text-sm mt-2 text-start">{errors.email.message}</Text>
        )}
      </View>

      <View className="col-span-1">
        <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">كلمة المرور</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={{ marginLeft: 12 }} />
              <TextInput
                className="flex-1 px-4 py-4 text-base"
                placeholder="أدخل كلمة المرور"
                placeholderTextColor="#9ca3af"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                style={{ textAlign: 'right', direction: 'ltr' }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="px-4"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text className="text-red-500 text-sm mt-2 text-start">{errors.password.message}</Text>
        )}
      </View>

      <View className='w-full flex flex-row justify-end items-center'>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          className="mb-2 p-0 w-max "
        >
          <Text className="text-primary-600 text-start font-medium text-base w-max">نسيت كلمة المرور؟</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-primary-600 rounded-xl py-4 mb-5 col-span-1"
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
          <Text className="text-white text-center font-bold text-base">تسجيل الدخول</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center items-center gap-2 " style={{ flexDirection: 'row-reverse' }}>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text className="text-primary-600 font-bold text-base text-start">إنشاء حساب</Text>
        </TouchableOpacity>
        <Text className="text-gray-600 text-base text-start">ليس لديك حساب؟</Text>
      </View>

      <View className='w-full flex flex-row justify-center items-center gap-4 bg-gray-200 rounded-xl h-0.5'></View>

      <View className='flex flex-row flex-wrap justify-center items-center gap-4  *:w-[48%] w-full'>

        <Button variant='outline' className='w-[30%]' onPress={() => handleDefaultData("client")} disabled={false} loading={false}>
          <Ionicons name="person-outline" size={24} color="#E02020" />
        </Button>
        <Button variant='outline' className='w-[30%]' onPress={() => handleDefaultData("driver")} disabled={false} loading={false}>
          <FontAwesome name="motorcycle" size={24} color="#E02020" />
        </Button>
        <Button variant='outline' className='w-[30%]' onPress={() => handleDefaultData("admin")} disabled={false} loading={false}>
          <Ionicons name="shield-outline" size={24} color="#E02020" />
        </Button>
        <Button variant='outline' className='w-full' onPress={() => router.push('/onboarding')} disabled={false} loading={false}>
          <Entypo name="flower" size={24} color="#E02020" />
        </Button>
      </View>
    </View>
  );
}