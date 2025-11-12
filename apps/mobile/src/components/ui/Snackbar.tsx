import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarProps {
    visible: boolean;
    message: string;
    type?: SnackbarType;
    duration?: number;
    onDismiss: () => void;
    action?: {
        label: string;
        onPress: () => void;
    };
}

const typeConfig: Record<SnackbarType, { color: string; bgColor: string; icon: string }> = {
    success: {
        color: '#16a34a',
        bgColor: 'bg-green-50',
        icon: 'checkmark-circle',
    },
    error: {
        color: '#dc2626',
        bgColor: 'bg-red-50',
        icon: 'close-circle',
    },
    info: {
        color: '#2563eb',
        bgColor: 'bg-blue-50',
        icon: 'information-circle',
    },
    warning: {
        color: '#d97706',
        bgColor: 'bg-orange-50',
        icon: 'warning',
    },
};

export default function Snackbar({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onDismiss,
    action,
}: SnackbarProps) {
    useEffect(() => {
        if (visible && duration > 0) {
            const timer = setTimeout(() => {
                onDismiss();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onDismiss]);

    if (!visible) return null;

    const config = typeConfig[type];

    return (
        <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(200)}
            className={`absolute top-12 left-4 right-4 z-50 ${config.bgColor} rounded-xl px-4 py-3 shadow-lg border border-gray-200`}
            style={{ direction: 'rtl' }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                    <Text className={`text-base font-semibold mr-3 flex-1`} style={{ color: config.color }}>
                        {message}
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    {action && (
                        <TouchableOpacity
                            onPress={action.onPress}
                            className="px-3 py-1 rounded-lg"
                            style={{ backgroundColor: config.color + '20' }}
                        >
                            <Text className="font-bold text-sm" style={{ color: config.color }}>
                                {action.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onDismiss} className="p-1">
                        <Ionicons name="close" size={20} color={config.color} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

