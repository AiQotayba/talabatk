import { View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';

export default function UserCardSkeleton() {
    return (
        <View className="bg-gray-100 animate-pulse rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
                <Skeleton width={48} height={48} borderRadius={24} />
                <View className="flex-1 gap-2">
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="50%" height={14} />
                </View>
            </View>
        </View>
    );
}

