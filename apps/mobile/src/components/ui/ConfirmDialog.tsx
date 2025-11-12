import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'نعم',
    cancelText = 'لا',
    type = 'info',
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmDialogProps) {
    const typeConfig = {
        danger: {
            confirmColor: '#dc2626',
            confirmBg: 'bg-red-50',
            icon: 'alert-circle',
            iconColor: '#dc2626',
        },
        warning: {
            confirmColor: '#d97706',
            confirmBg: 'bg-orange-50',
            icon: 'warning',
            iconColor: '#d97706',
        },
        info: {
            confirmColor: '#2563eb',
            confirmBg: 'bg-blue-50',
            icon: 'information-circle',
            iconColor: '#2563eb',
        },
    };

    const config = typeConfig[type];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-4">
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                    style={{ direction: 'rtl' }}
                >
                    <View className="items-center mb-4">
                        <View className={`w-16 h-16 rounded-full ${config.confirmBg} items-center justify-center mb-3`}>
                            <Ionicons name={config.icon as any} size={32} color={config.iconColor} />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 text-right mb-2">{title}</Text>
                        <Text className="text-gray-600 text-base text-right ">{message}</Text>
                    </View>

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200"
                            onPress={onCancel}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Text className="text-center font-semibold text-gray-700">{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 px-4 rounded-xl`}
                            style={{ backgroundColor: config.confirmColor }}
                            onPress={onConfirm}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text className="text-center font-semibold text-white">{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

