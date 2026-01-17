import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/utils/constants';

export default function DriverLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated or not a driver
  if (!isAuthenticated || user?.role !== 'driver') {
    return <Redirect href={ROUTES.LOGIN} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}