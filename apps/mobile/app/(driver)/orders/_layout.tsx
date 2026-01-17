import { Stack } from 'expo-router';

export default function DriverOrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="scan-qr" />
    </Stack>
  );
}

