import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { ROUTES, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setOnboardingCompleted(completed === 'true');
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setOnboardingCompleted(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    if (!isLoading) {
      checkOnboarding();
    }
  }, [isLoading]);

  if (isLoading || isCheckingOnboarding) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#E02020" />
      </View>
    );
  }

  // Check onboarding first
  if (!onboardingCompleted) {
    return <Redirect href={ROUTES.ONBOARDING} />;
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.LOGIN} />;
  }
  // Redirect based on user role
  if (user?.role === 'client') {
    return <Redirect href={ROUTES.CLIENT_HOME} />;
  } else if (user?.role === 'driver') {
    return <Redirect href={ROUTES.DRIVER_HOME} />;
  } else if (user?.role === 'admin') {
    return <Redirect href={ROUTES.ADMIN_HOME} />;
  }

  return <Redirect href={ROUTES.LOGIN} />;
}


