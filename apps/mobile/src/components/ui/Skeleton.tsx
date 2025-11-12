import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    className?: string;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
    const opacity = useSharedValue(0.3);

    opacity.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
    );

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const staticStyle = {
        width: width as any,
        height: height as any,
        borderRadius,
    };

    return (
        <Animated.View
            className={`bg-gray-200 ${className}`}
            style={[staticStyle, animatedStyle]}
        />
    );
}

