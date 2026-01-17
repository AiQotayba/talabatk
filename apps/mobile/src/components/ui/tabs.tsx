import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
    hideInactiveLabels?: boolean; // إخفاء النص للتبويبات غير النشطة
    scrollable?: boolean; // تفعيل السكرول العرضي
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '', hideInactiveLabels = false, scrollable = false }: TabsProps) {
    const containerClass = scrollable 
        ? `bg-gray-100 rounded-xl p-2 ${className}` 
        : `bg-gray-100 rounded-xl p-2 flex-row gap-2 ${className}`;

    const renderTabs = () => {
        return tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const tabClass = scrollable
                ? `py-3 px-4 rounded-lg items-center justify-center mr-2 ${isActive ? 'bg-primary-600' : 'bg-gray-100'}`
                : `flex-1 py-3 px-4 rounded-lg items-center justify-center ${isActive ? 'bg-primary-600' : 'bg-gray-100'}`;
            
            return (
                <TouchableOpacity
                    key={tab.id}
                    className={tabClass}
                    onPress={() => onTabChange(tab.id)}
                    activeOpacity={0.7}
                    style={scrollable ? { minWidth: 80 } : undefined}
                >
                    <Animated.View
                        entering={FadeInDown.duration(300).delay(index * 50)}
                        className="items-center flex-row gap-2"
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
                        {(!hideInactiveLabels || isActive) && (
                            <Text
                                className={`text-xs font-semibold mt-1 text-start ${isActive ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        )}
                    </Animated.View>
                </TouchableOpacity>
            );
        });
    };

    if (scrollable) {
        return (
            <View className={containerClass} style={{ direction: 'rtl' }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ 
                        paddingHorizontal: 4,
                        flexDirection: 'row',
                        gap: 8
                    }}
                    style={{ direction: 'rtl' }}
                >
                    {renderTabs()}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className={containerClass} style={{ direction: 'rtl' }}>
            {renderTabs()}
        </View>
    );
}

