import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FeaturedOrder } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useRef, useEffect, useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';

interface FeaturedOrdersSliderProps {
    featuredOrders: FeaturedOrder[];
    isLoading: boolean;
}

function FeaturedOrderCardSkeleton() {
    return (
        <View className="bg-white rounded-xl p-5 shadow-sm mb-3" style={{ width: 350 }}>
            <View className="mb-4">
                <Skeleton width="90%" height={20} borderRadius={8} />
                <Skeleton width="70%" height={16} borderRadius={8} className="mt-2" />
            </View>
            <View className="flex-row items-center gap-2 mb-4">
                <Skeleton width={16} height={16} borderRadius={4} />
                <Skeleton width="60%" height={14} borderRadius={6} />
            </View>
            <Skeleton width="100%" height={44} borderRadius={12} />
        </View>
    );
}

function FeaturedOrderDetailsDialog({
    visible,
    featuredOrder,
    onClose,
    onConfirm
}: {
    visible: boolean;
    featuredOrder: FeaturedOrder | null;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!featuredOrder) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-4" style={{ direction: 'rtl' }}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    className="bg-white rounded-2xl w-full max-w-md shadow-xl"
                    style={{ direction: 'rtl' }}
                >
                    <View className="p-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-900 text-start">تفاصيل الطلب المميز</Text>
                            <TouchableOpacity onPress={onClose} className="p-2">
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View className="mb-6">
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-500 mb-2 text-start">الوصف</Text>
                                <Text className="text-base text-gray-900 text-start leading-6">
                                    {featuredOrder.context}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                                activeOpacity={0.7}
                            >
                                <Text className="text-gray-700 font-semibold text-base text-start">إلغاء</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onConfirm}
                                className="flex-1 bg-primary-600 rounded-xl py-3 flex-row items-center justify-center gap-2"
                                activeOpacity={0.8}
                                style={{
                                    shadowColor: '#E02020',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color="#ffffff" />
                                <Text className="text-white font-semibold text-base text-start">إنشاء طلب</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

function FeaturedOrderCard({
    featuredOrder,
    index,
    onCardPress,
    onCreateOrder
}: {
    featuredOrder: FeaturedOrder;
    index: number;
    onCardPress: () => void;
    onCreateOrder: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCardPress}
        >
            <Animated.View
                entering={FadeInDown.duration(4000).delay(index * 100)}
                className="bg-white rounded-xl p-5 shadow-sm my-2"
                style={{ width: 300, marginHorizontal: 6 }}
            >
                <View style={{ direction: 'rtl' }}>
                    <Text className="text-lg font-bold text-gray-900 mb-4 text-start" numberOfLines={5}>
                        {featuredOrder.context}
                    </Text>
                </View>
                <View className="flex-row items-center justify-end">
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onCreateOrder();
                        }}
                        className="w-40 bg-primary-600 rounded-xl py-3 flex-row items-center justify-center gap-2 right-0"
                        activeOpacity={0.8}
                        style={{
                            shadowColor: '#E02020',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 5,
                            direction: 'rtl',
                        }}
                    >
                        <Ionicons name="add-circle" size={20} color="#ffffff" />
                        <Text className="text-white font-semibold text-base text-start">إنشاء طلب</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function FeaturedOrdersSlider({ featuredOrders, isLoading }: FeaturedOrdersSliderProps) {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<FeaturedOrder | null>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const cardWidth = 300 + 12; // width (350) + margin (6*2)

    // Calculate scroll position for RTL (from right to left)
    const getRTLScrollPosition = (index: number) => {
        const totalWidth = featuredOrders.length * cardWidth;
        return totalWidth - (index * cardWidth) - cardWidth;
    };

    // Initialize scroll position to middle set (for infinite scroll) - RTL starts from right
    useEffect(() => {
        if (scrollViewRef.current && featuredOrders.length > 0) {
            setTimeout(() => {
                const initialPosition = getRTLScrollPosition(featuredOrders.length);
                scrollViewRef.current?.scrollTo({
                    x: initialPosition,
                    animated: false,
                });
                setCurrentIndex(featuredOrders.length);
            }, 100);
        }
    }, [cardWidth, featuredOrders.length]);

    // Auto-scroll every 5 seconds (RTL - from right to left)
    useEffect(() => {
        if (featuredOrders.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const nextIndex = prev + 1;
                // If we've scrolled to the end of second set, jump back to start of second set
                if (nextIndex >= featuredOrders.length * 2) {
                    setTimeout(() => {
                        const resetPosition = getRTLScrollPosition(featuredOrders.length);
                        scrollViewRef.current?.scrollTo({
                            x: resetPosition,
                            animated: false
                        });
                        setCurrentIndex(featuredOrders.length);
                    }, 50);
                    return featuredOrders.length;
                }
                return nextIndex;
            });
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [cardWidth, featuredOrders.length]);

    // Scroll to current index (RTL)
    useEffect(() => {
        if (scrollViewRef.current && featuredOrders.length > 0) {
            const scrollPosition = getRTLScrollPosition(currentIndex);
            scrollViewRef.current.scrollTo({
                x: scrollPosition,
                animated: true,
            });
        }
    }, [currentIndex, cardWidth, featuredOrders.length]);

    if (isLoading) {
        return (
            <View className="mb-6" style={{ direction: 'rtl' }}>
                <View className="flex-row items-center justify-between mb-4">
                    <Skeleton width={150} height={24} borderRadius={8} />
                    <Skeleton width={80} height={20} borderRadius={6} />
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: 'row' }}
                    style={{ direction: 'rtl' }}
                >
                    {[1, 2, 3].map((i) => (
                        <FeaturedOrderCardSkeleton key={i} />
                    ))}
                </ScrollView>
            </View>
        );
    }

    if (!featuredOrders || featuredOrders.length === 0) {
        return null;
    }

    return (
        <Animated.View entering={FadeInDown.duration(600)} className="mb-6" style={{ direction: 'rtl' }}>
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900 text-start">الطلبات المميزة</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={false}
                contentContainerStyle={{
                    flexDirection: 'row-reverse',
                    paddingHorizontal: 6,
                }}
                style={{ direction: 'rtl' }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    // For RTL, calculate index from right to left
                    const totalWidth = featuredOrders.length * cardWidth;
                    const scrollFromRight = totalWidth - offsetX;
                    const index = Math.round(scrollFromRight / cardWidth);
                    setCurrentIndex(index);
                }}
            >
                {featuredOrders.map((featuredOrder, index) => (
                    <FeaturedOrderCard
                        key={`${featuredOrder.id}-${index}`}
                        featuredOrder={featuredOrder}
                        index={index % featuredOrders.length}
                        onCardPress={() => {
                            setSelectedOrder(featuredOrder);
                            setIsDialogVisible(true);
                        }}
                        onCreateOrder={() => {
                            router.push({
                                pathname: '/(client)/orders/create',
                                params: { featuredOrderContext: featuredOrder.context }
                            } as any);
                        }}
                    />
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            {featuredOrders.length > 1 && (
                <View className="flex-row items-center justify-center gap-2 mt-4" style={{ direction: 'rtl' }}>
                    {featuredOrders.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full ${currentIndex % featuredOrders.length === index
                                ? 'bg-primary-600 w-6'
                                : 'bg-gray-300 w-2'
                                }`}
                        />
                    ))}
                </View>
            )}

            {/* Featured Order Details Dialog */}
            <FeaturedOrderDetailsDialog
                visible={isDialogVisible}
                featuredOrder={selectedOrder}
                onClose={() => {
                    setIsDialogVisible(false);
                    setSelectedOrder(null);
                }}
                onConfirm={() => {
                    setIsDialogVisible(false);
                    if (selectedOrder) {
                        router.push({
                            pathname: '/(client)/orders/create',
                            params: { featuredOrderContext: selectedOrder.context }
                        } as any);
                    }
                    setSelectedOrder(null);
                }}
            />
        </Animated.View>
    );
}

