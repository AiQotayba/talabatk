import { ActivityIndicator, ButtonProps, Text, TouchableOpacity } from "react-native";

export function Button({ children, onPress, disabled, loading }: { children: React.ReactNode, onPress: () => void, disabled: boolean, loading: boolean }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} className="bg-primary-600 rounded-xl py-4 mb-5 col-span-1" style={{
            shadowColor: '#E02020',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        }}>
            {loading
                ? <ActivityIndicator color="white" />
                : <Text className="text-white text-center font-bold text-base">{children}</Text>}
        </TouchableOpacity>
    )
}