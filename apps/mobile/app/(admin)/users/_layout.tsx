import { Stack } from 'expo-router';

export default function AdminUsersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="clients" />
      <Stack.Screen name="drivers" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}


