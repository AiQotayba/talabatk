import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/utils/constants';

export default function AdminLayout() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    // Redirect to login if not authenticated or not an admin
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Redirect href={ROUTES.LOGIN} />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="users" />
            <Stack.Screen name="featured-orders" />
            <Stack.Screen name="banners" />
            <Stack.Screen name="analytics" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="map" />
        </Stack>
    );
}


