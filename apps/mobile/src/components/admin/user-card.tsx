import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import UserCardSkeleton from './UserCardSkeleton';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'client' | 'driver' | 'admin';
    profile_photo_url?: string;
}

interface UserCardProps {
    user: User;
    index: number;
}

export default function UserCard({ user, index }: UserCardProps) {
    return (
        <TouchableOpacity onPress={() => router.push(`/(admin)/users/${user.id}` as any)}>
            <Animated.View
                key={user.id}
                entering={FadeInDown.duration(600).delay(index * 50)}
                className="bg-white rounded-xl p-4 shadow-sm"
            >
                <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                        {user.profile_photo_url ? (
                            <Ionicons name="person" size={24} color="#E02020" />
                        ) : (
                            <Ionicons name="person" size={24} color="#E02020" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 text-start">{user.name}</Text>
                        <Text className="text-sm text-gray-600 text-start">{user.phone}</Text>
                    </View>
                    <Ionicons name="chevron-back" size={20} color="#9ca3af" />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export { UserCardSkeleton };


