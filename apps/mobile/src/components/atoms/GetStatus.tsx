import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStatusText } from "../orderChat/utils";
import { Text } from "react-native";

export default function GetStatus({ name }: { name: string }) {
    const content = {
        delivered: {
            icon: 'checkmark-circle',
            color: 'bg-success-100 text-success-700',
        },
        cancelled: {
            icon: 'close-circle',
            color: 'bg-error-100 text-error-700',
        },
        failed: {
            icon: 'close-circle',
            color: 'bg-error-100 text-error-700',
        },
        pending: {
            icon: 'time',
            color: 'bg-warning-100 text-warning-700',
        },
        assigned: {
            icon: 'time',
            color: 'bg-warning-100 text-warning-700',
        },
        default: {
            icon: 'information-circle',
            color: 'bg-gray-100 text-gray-700',
        },
    };
    return (
        <View className={`px-3 py-1 rounded-lg ${content[name as keyof typeof content].color} w-max flex-row items-center gap-2`}>
            <Ionicons name={content[name as keyof typeof content].icon as any} size={16} color={content[name as keyof typeof content].color.split(' ')[1]} />
            <Text className="text-xs font-semibold">{getStatusText(name)}</Text>
        </View>
    )
}