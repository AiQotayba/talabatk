import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/utils/constants';

export default function ClientLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated or not a client
  if (!isAuthenticated || user?.role !== 'client') {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="policy" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="faq" />
    </Stack>
  );
}

