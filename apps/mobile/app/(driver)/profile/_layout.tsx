import { Stack } from 'expo-router';

export default function DriverProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
}

