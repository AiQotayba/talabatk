import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from './user-card';
import UserCardSkeleton from './UserCardSkeleton';
import UserCard from './user-card';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface UserGridProps {
    users: User[];
    isLoading: boolean;
    emptyMessage?: string;
    emptyIcon?: string;
}

export default function UserGrid({ users, isLoading, emptyMessage = 'لا يوجد مستخدمين', emptyIcon = 'people-outline' }: UserGridProps) {
    if (isLoading) {
        return (
            <View className="flex-col gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index}>
                        <UserCardSkeleton />
                    </View>
                ))}
            </View>
        );
    }

    if (!users || users.length === 0) {
        return (
            <Animated.View entering={FadeInDown.duration(600)} className="py-12 items-center bg-white rounded-xl">
                <Ionicons name={emptyIcon as any} size={64} color="#d1d5db" />
                <Text className="text-gray-500 text-right mt-4">{emptyMessage}</Text>
            </Animated.View>
        );
    }

    return (
        <View className="flex-col gap-3">
            {users.map((user, index) => (
                <UserCard key={user.id} user={user} index={index} />
            ))}
        </View>
    );
}

