import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/store/slices/auth.slice';
import { ROUTES } from '@/utils/constants';
import { UserRole } from '@/types/auth.types';

const signupSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
  role: z.enum(['client', 'driver', 'admin']),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'client',
    },
  });


  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await dispatch(register(data)).unwrap();

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
      Alert.alert('فشل التسجيل', error || 'الرجاء التحقق من المعلومات المدخلة');
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 py-12 gap-4 grid grid-cols-1" style={{ direction: 'rtl' }}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8">
          <View className="items-center mb-6">
            <View className="bg-primary-100 rounded-full p-4 w-20 h-20 items-center justify-center mb-4">
              <Ionicons name="person-add" size={40} color="#E02020" />
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">انشئ حسابك</Text>
          <Text className="text-gray-600 text-base text-center">سجل حساب جديد للبدء</Text>
        </Animated.View>

        <View className="col-span-1">
          <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">الاسم الكامل</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-4 py-4 text-base"
                  placeholder="أدخل اسمك الكامل"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={{ textAlign: 'right' }}
                />
              </View>
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-2 text-start">{errors.name.message}</Text>
          )}
        </View>

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
          <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">رقم الهاتف</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50">
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-4 py-4 text-base"
                  placeholder="أدخل رقم هاتفك"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  style={{ textAlign: 'right', direction: 'ltr' }}
                />
              </View>
            )}
          />
          {errors.phone && (
            <Text className="text-red-500 text-sm mt-2 text-start">{errors.phone.message}</Text>
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

        {/* <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-900 mb-3 text-start">نوع الحساب</Text>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-3 justify-start items-start">
                {([
                  { role: 'client' as UserRole, label: 'عميل', icon: 'person' },
                  { role: 'driver' as UserRole, label: 'سائق', icon: 'car-outline' },
                  { role: 'admin' as UserRole, label: 'مدير', icon: 'shield-checkmark' },
                ]).map(({ role, label, icon }) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => onChange(role)}
                    className={`flex-1 border-2 rounded-xl py-4 px-3 items-center ${
                      value === role
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={value === role ? '#E02020' : '#6b7280'}
                    />
                    <Text
                      className={`text-center font-semibold text-sm mt-2 ${
                        value === role ? 'text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View> */}

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 my-6 col-span-1"
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
            <Text className="text-white text-center font-bold text-base">إنشاء الحساب</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center items-center gap-2 col-span-1" style={{ flexDirection: 'row-reverse' }}>
          <TouchableOpacity onPress={() => router.push(ROUTES.LOGIN)}>
            <Text className="text-primary-600 font-bold text-base">تسجيل الدخول</Text>
          </TouchableOpacity>
          <Text className="text-gray-600 text-base">لديك حساب بالفعل؟</Text>
        </View>
      </View>
    </ScrollView>
  );
}

