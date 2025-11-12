import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from "react-native";

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: ViewStyle;
}

export function Button({ 
    children, 
    variant = 'primary', 
    onPress, 
    disabled = false, 
    loading = false,
    className = '',
    style
}: ButtonProps) {
    const getVariantStyles = () => {
        const baseStyles = 'px-6 py-3.5 rounded-xl items-center justify-center min-h-[48px]';
        const isDisabled = disabled || loading;

        switch (variant) {
            case 'primary':
                return {
                    container: `${baseStyles} ${isDisabled ? 'bg-gray-300' : 'bg-primary-600'}`,
                    text: isDisabled ? 'text-gray-500' : 'text-white',
                    shadow: !isDisabled ? {
                        shadowColor: '#E02020',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                    } : undefined,
                };
            case 'secondary':
                return {
                    container: `${baseStyles} ${isDisabled ? 'bg-gray-200' : 'bg-gray-600'}`,
                    text: isDisabled ? 'text-gray-400' : 'text-white',
                    shadow: !isDisabled ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 3,
                    } : undefined,
                };
            case 'outline':
                return {
                    container: `${baseStyles} border-2 ${isDisabled ? 'border-gray-300 bg-transparent' : 'border-primary-600 bg-transparent'}`,
                    text: isDisabled ? 'text-gray-400' : 'text-primary-600',
                    shadow: undefined,
                };
            case 'ghost':
                return {
                    container: `${baseStyles} bg-transparent`,
                    text: isDisabled ? 'text-gray-400' : 'text-primary-600',
                    shadow: undefined,
                };
            default:
                return {
                    container: `${baseStyles} ${isDisabled ? 'bg-gray-300' : 'bg-primary-600'}`,
                    text: isDisabled ? 'text-gray-500' : 'text-white',
                    shadow: !isDisabled ? {
                        shadowColor: '#E02020',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 5,
                    } : undefined,
                };
        }
    };

    const styles = getVariantStyles();
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            className={`${styles.container} ${className}`}
            style={[styles.shadow, style, isDisabled && { opacity: 0.6 }]}
        >
            {loading ? (
                <ActivityIndicator 
                    color={variant === 'outline' || variant === 'ghost' ? '#E02020' : '#ffffff'} 
                    size="small"
                />
            ) : (
                <Text className={`text-base font-semibold ${styles.text}`}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
}