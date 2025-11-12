import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface TabItem {
    id: string;
    label: string;
    icon: string;
    badge?: number;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
    return (
        <View className={`bg-white rounded-xl p-2 flex-row gap-2 ${className}`} style={{ direction: 'rtl' }}>
            {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                    <TouchableOpacity
                        key={tab.id}
                        className={`flex-1 py-3 px-4 rounded-lg items-center justify-center ${isActive ? 'bg-primary-600' : 'bg-gray-100'
                            }`}
                        onPress={() => onTabChange(tab.id)}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            entering={FadeInDown.duration(300).delay(index * 50)}
                            className="items-center"
                        >
                            <View className="relative">
                                <Ionicons
                                    name={tab.icon as any}
                                    size={20}
                                    color={isActive ? '#ffffff' : '#6b7280'}
                                />
                                {tab.badge && tab.badge > 0 && (
                                    <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                                        <Text className="text-white text-xs font-bold">{tab.badge > 99 ? '99+' : tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className={`text-xs font-semibold mt-1 ${isActive ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

