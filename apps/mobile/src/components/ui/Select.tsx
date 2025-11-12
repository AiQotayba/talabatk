import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface SelectOption {
    label: string;
    value: string;
    icon?: string;
    color?: string;
}

interface SelectProps {
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
}

export default function Select({
    value,
    options,
    onValueChange,
    placeholder = 'اختر...',
    disabled = false,
    label,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
    };

    return (
        <View style={{ direction: 'rtl' }}>
            {label && (
                <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">{label}</Text>
            )}
            <TouchableOpacity
                className="border border-gray-300 max-h-10 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
                onPress={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-start flex-1">
                    {selectedOption?.icon && (
                        <Ionicons
                            name={selectedOption.icon as any}
                            size={20}
                            color={selectedOption.color || '#374151'}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text className={`text-base flex-1 ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`} style={{ textAlign: 'left' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 w-full h-full"
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View className="flex-1 justify-end" style={{ direction: 'rtl' }}>
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(150)}
                            className="bg-white rounded-t-3xl max-h-[80%]"
                        >
                            <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
                                <Text className="text-xl font-bold text-gray-900 text-right">اختر الحالة</Text>
                                <TouchableOpacity onPress={() => setIsOpen(false)}>
                                    <Ionicons name="close" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView className="max-h-96">
                                {options.map((option) => {
                                    const isSelected = value === option.value;
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            className={`px-6 py-4 border-b border-gray-100 flex-row items-center ${isSelected ? 'bg-primary-50' : 'bg-white'
                                                }`}
                                            onPress={() => handleSelect(option.value)}
                                            activeOpacity={0.7}
                                        >
                                            {option.icon && (
                                                <Ionicons
                                                    name={option.icon as any}
                                                    size={24}
                                                    color={option.color || (isSelected ? '#E02020' : '#6b7280')}
                                                    style={{ marginLeft: 12 }}
                                                />
                                            )}
                                            <Text
                                                className={`text-base  flex-1 mx-2 ${isSelected ? 'text-primary-600 font-semibold' : 'text-gray-900'}`}
                                                style={{ textAlign: 'left' }}
                                            >
                                                {option.label}
                                            </Text>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={20} color="#E02020" style={{ marginRight: 8 }} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

