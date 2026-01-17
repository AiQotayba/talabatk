import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { Address } from '@/types/order.types';
import ImageUploadInput from '@/components/ui/ImageUploadInput';

// Schema for add mode (lat/lng required)
const addAddressSchema = z.object({
    city: z.string().min(2, 'المدينة مطلوبة'),
    street: z.string().min(5, 'عنوان الشارع يجب أن يكون على الأقل 5 أحرف'),
    label: z.string().min(2, 'الاسم مطلوب'),
    notes: z.string().optional(),
    building_number: z.string().optional(),
    building_image_url: z.string().optional(),
    door_image_url: z.string().optional(),
    is_default: z.boolean().default(false),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
}).refine((data) => data.lat !== undefined && data.lat !== 0, {
    message: 'الموقع مطلوب',
    path: ['lat'],
}).refine((data) => data.lng !== undefined && data.lng !== 0, {
    message: 'الموقع مطلوب',
    path: ['lng'],
});

// Schema for edit mode (lat/lng optional)
const editAddressSchema = z.object({
    city: z.string().min(2, 'المدينة مطلوبة'),
    street: z.string().min(5, 'عنوان الشارع يجب أن يكون على الأقل 5 أحرف'),
    label: z.string().min(2, 'الاسم مطلوب'),
    notes: z.string().optional(),
    building_number: z.string().optional(),
    building_image_url: z.string().optional(),
    door_image_url: z.string().optional(),
    is_default: z.boolean().default(false),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
});

export type AddressFormData = z.infer<typeof addAddressSchema>;

interface AddressFormProps {
    mode: 'add' | 'edit';
    initialData?: Address;
    onSubmit: (data: AddressFormData) => void | Promise<void>;
    isSubmitting?: boolean;
    showMap?: boolean;
    textDirection?: 'rtl' | 'ltr';
}

export default function AddressForm({
    mode,
    initialData,
    onSubmit,
    isSubmitting = false,
    showMap = true,
    textDirection = 'rtl',
}: AddressFormProps) {
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: initialData?.lat || 36.0156, // Default to Maarat Misrin, Syria
        longitude: initialData?.lng || 36.6731,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        initialData?.lat && initialData?.lng
            ? { lat: initialData.lat, lng: initialData.lng }
            : null
    );
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    const schema = mode === 'add' ? addAddressSchema : editAddressSchema;
    const isRTL = textDirection === 'rtl';

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<AddressFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            city: initialData?.city || '',
            street: initialData?.street || '',
            label: initialData?.label || '',
            notes: initialData?.notes || '',
            building_number: (initialData as any)?.building_number || '',
            building_image_url: initialData?.building_image_url || '',
            door_image_url: initialData?.door_image_url || '',
            is_default: initialData?.is_default || false,
            lat: initialData?.lat || 0,
            lng: initialData?.lng || 0,
        },
    });

    // Watch for location changes
    const currentLat = watch('lat');
    const currentLng = watch('lng');

    // Update map region when location is set
    useEffect(() => {
        if (currentLat && currentLng && currentLat !== 0 && currentLng !== 0) {
            setMapRegion({
                latitude: currentLat,
                longitude: currentLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setSelectedLocation({ lat: currentLat, lng: currentLng });
        }
    }, [currentLat, currentLng]);

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                city: initialData.city || '',
                street: initialData.street || '',
                label: initialData.label || '',
                notes: initialData.notes || '',
                building_number: (initialData as any)?.building_number || '',
                building_image_url: initialData?.building_image_url || '',
                door_image_url: initialData?.door_image_url || '',
                is_default: initialData.is_default || false,
                lat: initialData.lat || 0,
                lng: initialData.lng || 0,
            });
            if (initialData.lat && initialData.lng) {
                setMapRegion({
                    latitude: initialData.lat,
                    longitude: initialData.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                setSelectedLocation({ lat: initialData.lat, lng: initialData.lng });
            }
        }
    }, [initialData, reset]);

    // Alternative reverse geocoding using Nominatim (OpenStreetMap) - free and no API key needed
    const reverseGeocodeWithNominatim = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'DeliveryApp/1.0', // Required by Nominatim
                    },
                }
            );
            
            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }
            
            const data = await response.json();
            if (data && (data as any).address) {
                const addr = (data as any).address;
                return {
                    street: addr.road || addr.pedestrian || addr.path || '',
                    streetNumber: addr.house_number || '',
                    city: addr.city || addr.town || addr.village || addr.municipality || '',
                };
            }
            return null;
        } catch (error) {
            console.error('Nominatim reverse geocoding error:', error);
            return null;
        }
    };

    const getCurrentLocation = async () => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('إذن مطلوب', 'نحتاج إلى إذن للوصول إلى الموقع');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Try reverse geocode with Nominatim (fallback if Google fails)
            try {
                const address = await reverseGeocodeWithNominatim(latitude, longitude);
                if (address) {
                    setValue('street', `${address.street || ''} ${address.streetNumber || ''}`.trim() || watch('street') || '');
                    setValue('city', address.city || watch('city') || '');
                }
            } catch (geocodeError) {
                // If reverse geocoding fails, user can enter address manually
            }

            // Store coordinates for submission
            setValue('lat', latitude);
            setValue('lng', longitude);

            // Update map region
            setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setSelectedLocation({ lat: latitude, lng: longitude });
        } catch (error: any) {
            console.error('Get location error:', error);
            Alert.alert('خطأ', 'فشل الحصول على الموقع. يرجى المحاولة مرة أخرى أو تحديد الموقع يدوياً على الخريطة.');
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;

        setSelectedLocation({ lat: latitude, lng: longitude });
        setValue('lat', latitude);
        setValue('lng', longitude);

        // Reverse geocode to get address using Nominatim
        setIsLoadingAddress(true);
        try {
            const address = await reverseGeocodeWithNominatim(latitude, longitude);
            if (address) {
                setValue('street', `${address.street || ''} ${address.streetNumber || ''}`.trim() || watch('street') || '');
                setValue('city', address.city || watch('city') || '');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // If reverse geocoding fails, user can enter address manually - no error shown
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleFormSubmit = async (data: AddressFormData) => {
        // Images are already uploaded by ImageUploadInput component
        // For add mode, ensure location is set
        if (mode === 'add') {
            let lat = data.lat;
            let lng = data.lng;

            if (!lat || !lng || lat === 0 || lng === 0) {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        return;
                    }
                    const location = await Location.getCurrentPositionAsync({});
                    lat = location.coords.latitude;
                    lng = location.coords.longitude;
                    setValue('lat', lat);
                    setValue('lng', lng);
                } catch (error: any) {
                    console.error('Get location error:', error);
                    return;
                }
            }

            // Ensure lat and lng are numbers
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                return;
            }

            await onSubmit({ ...data, lat: lat as number, lng: lng as number });
        } else {
            await onSubmit(data);
        }
    };

    const textAlign = isRTL ? 'right' : 'left';
    const flexDirection = isRTL ? 'row-reverse' : 'row';
    const textStart = 'text-start'
    const marginStart = isRTL ? 'mr' : 'ml';
    const marginEnd = isRTL ? 'ml' : 'mr';

    return (
        <View>
            {showMap && (
                <Animated.View entering={FadeInDown.duration(600)}>
                    <View className="mb-6">
                        <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>
                            اختر الموقع على الخريطة
                        </Text>
                        <View className="rounded-xl overflow-hidden border border-gray-300" style={{ height: 250 }}>
                            <MapView
                                provider={PROVIDER_DEFAULT}
                                style={{ flex: 1 }}
                                region={mapRegion}
                                onPress={handleMapPress}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                showsCompass={false}
                                toolbarEnabled={false}
                            >
                                {/* OpenStreetMap Tiles */}
                                <UrlTile
                                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maximumZ={19}
                                    flipY={false}
                                />

                                {/* Marker for selected location */}
                                {selectedLocation && (
                                    <Marker
                                        coordinate={{
                                            latitude: selectedLocation.lat,
                                            longitude: selectedLocation.lng,
                                        }}
                                        title="الموقع المحدد"
                                        description="انقر على الخريطة لتغيير الموقع"
                                    >
                                        <View className="items-center justify-center">
                                            <Ionicons name="location" size={32} color="#E02020" />
                                            <View className="absolute top-6 w-3 h-3 bg-primary-600 rounded-full" />
                                        </View>
                                    </Marker>
                                )}
                            </MapView>
                            {isLoadingAddress && (
                                <View className={`absolute top-2 ${isRTL ? 'right' : 'left'}-2 bg-white rounded-lg px-3 py-2 flex-row items-center shadow-lg`}>
                                    <ActivityIndicator size="small" color="#E02020" />
                                    <Text className={`text-xs text-gray-700 ${marginEnd}-2`}>جاري تحديث العنوان...</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            className="bg-primary-50 border border-primary-200 rounded-lg p-3 mt-2 flex-row items-center justify-center"
                            onPress={getCurrentLocation}
                            disabled={isGettingLocation}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="locate" size={20} color="#E02020" />
                            <Text className={`text-primary-600 font-semibold ${marginEnd}-2`}>
                                {isGettingLocation ? 'جاري الحصول على الموقع...' : 'استخدام موقعي الحالي'}
                            </Text>
                            {isGettingLocation && <ActivityIndicator size="small" color="#E02020" style={{ [marginEnd]: 8 }} />}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {!showMap && (
                <Animated.View entering={FadeInDown.duration(600)}>
                    <TouchableOpacity
                        className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mb-6 flex-row items-center"
                        onPress={getCurrentLocation}
                        disabled={isGettingLocation}
                        activeOpacity={0.7}
                        style={{ flexDirection }}
                    >
                        <Ionicons name="location" size={24} color="#E02020" />
                        <View className={`${marginStart}-3 flex-1`}>
                            <Text className={`font-bold text-gray-900 ${textStart}`}>
                                {mode === 'add' ? 'استخدام الموقع الحالي' : 'تحديث الموقع الحالي'}
                            </Text>
                            <Text className={`text-gray-600 text-sm ${textStart} mt-1`}>
                                {isGettingLocation ? 'جاري الحصول على الموقع...' : 'الحصول على موقعك تلقائياً'}
                            </Text>
                        </View>
                        {isGettingLocation && <ActivityIndicator color="#E02020" />}
                    </TouchableOpacity>
                </Animated.View>
            )}

            <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                <View className="mb-5">
                    <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>الاسم</Text>
                    <Controller
                        control={control}
                        name="label"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`border border-gray-300 rounded-xl px-4 py-4 text-base bg-white ${textStart}`}
                                placeholder="مثال: المنزل، العمل"
                                placeholderTextColor="#9ca3af"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={{ textAlign }}
                            />
                        )}
                    />
                    {errors.label && (
                        <Text className={`text-red-500 text-sm mt-2 ${textStart}`}>{errors.label.message}</Text>
                    )}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(150)}>
                <View className="mb-5">
                    <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>عنوان الشارع</Text>
                    <Controller
                        control={control}
                        name="street"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`border border-gray-300 rounded-xl px-4 py-4 text-base bg-white ${textStart}`}
                                placeholder="أدخل عنوان الشارع"
                                placeholderTextColor="#9ca3af"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={{ textAlign }}
                            />
                        )}
                    />
                    {errors.street && (
                        <Text className={`text-red-500 text-sm mt-2 ${textStart}`}>{errors.street.message}</Text>
                    )}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                <View className="mb-5">
                    <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>المدينة</Text>
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`border border-gray-300 rounded-xl px-4 py-4 text-base bg-white ${textStart}`}
                                placeholder="أدخل المدينة"
                                placeholderTextColor="#9ca3af"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={{ textAlign }}
                            />
                        )}
                    />
                    {errors.city && (
                        <Text className={`text-red-500 text-sm mt-2 ${textStart}`}>{errors.city.message}</Text>
                    )}
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(250)}>
                <View className="mb-5">
                    <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>رقم المبنى (اختياري)</Text>
                    <Controller
                        control={control}
                        name="building_number"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`border border-gray-300 rounded-xl px-4 py-4 text-base bg-white ${textStart}`}
                                placeholder="أدخل رقم المبنى"
                                placeholderTextColor="#9ca3af"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                style={{ textAlign }}
                            />
                        )}
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(300)}>
                <View className="mb-5">
                    <ImageUploadInput
                        name="building_image_url"
                        control={control}
                        label="صورة البناء (اختياري)"
                        variant="rectangle"
                        folder="addresses"
                        aspect={[4, 3]}
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(350)}>
                <View className="mb-5">
                    <ImageUploadInput
                        name="door_image_url"
                        control={control}
                        label="صورة باب المنزل (اختياري)"
                        variant="rectangle"
                        folder="addresses"
                        aspect={[4, 3]}
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                <View className="mb-5">
                    <Text className={`text-sm font-semibold text-gray-900 mb-2 ${textStart}`}>ملاحظات (اختياري)</Text>
                    <Controller
                        control={control}
                        name="notes"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className={`border border-gray-300 rounded-xl px-4 py-4 text-base bg-white ${textStart}`}
                                placeholder="تعليمات إضافية للتوصيل"
                                placeholderTextColor="#9ca3af"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                style={{ textAlign }}
                            />
                        )}
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(450)}>
                <View className="mb-6">
                    <Controller
                        control={control}
                        name="is_default"
                        render={({ field: { onChange, value } }) => (
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => onChange(!value)}
                                activeOpacity={0.7}
                                style={{ flexDirection }}
                            >
                                <View
                                    className={`w-6 h-6 border-2 rounded-lg ${marginEnd}-3 items-center justify-center ${value ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                                        }`}
                                >
                                    {value && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                                <Text className={`text-gray-700 text-base ${textStart}`}>تعيين كعنوان افتراضي</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(500)}>
                <TouchableOpacity
                    className="bg-primary-600 rounded-xl py-4"
                    onPress={handleSubmit(handleFormSubmit)}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                    style={{
                        shadowColor: '#E02020',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-base">
                            {mode === 'add' ? 'حفظ العنوان' : 'تحديث العنوان'}
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

