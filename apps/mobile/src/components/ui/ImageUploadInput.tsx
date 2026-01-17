import { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { uploadSingleImage } from '@/utils/imageUpload';
import { Toast } from '@/utils/toast';

export interface ImageUploadInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    variant?: 'profile' | 'square' | 'rectangle';
    folder?: string;
    disabled?: boolean;
    aspect?: [number, number];
    quality?: number;
    error?: string;
    helperText?: string;
}

export default function ImageUploadInput<T extends FieldValues>({
    name,
    control,
    label,
    variant = 'square',
    folder = 'general',
    disabled = false,
    aspect = [4, 3],
    quality = 0.8,
    error,
    helperText,
}: ImageUploadInputProps<T>) {
    const [isUploading, setIsUploading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const fieldRef = useRef<{ onChange: (value: string) => void; value: string } | null>(null);

    const styles = useMemo(() => {
        switch (variant) {
            case 'profile':
                return {
                    container: 'w-32 h-32 rounded-full',
                    iconSize: 64,
                    cameraIconSize: 20,
                    cameraPosition: 'bottom-0 right-0',
                };
            case 'square':
                return {
                    container: 'w-full aspect-square rounded-xl',
                    iconSize: 48,
                    cameraIconSize: 24,
                    cameraPosition: 'top-2 right-2',
                };
            case 'rectangle':
                return {
                    container: 'w-full rounded-xl',
                    height: 200,
                    iconSize: 48,
                    cameraIconSize: 24,
                    cameraPosition: 'top-2 right-2',
                };
            default:
                return {
                    container: 'w-full aspect-square rounded-xl',
                    iconSize: 48,
                    cameraIconSize: 24,
                    cameraPosition: 'top-2 right-2',
                };
        }
    }, [variant]);

    const pickImage = useCallback(async (onChange: (value: string) => void, currentValue: string) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.error('إذن مطلوب', 'يجب منح إذن الوصول إلى الصور');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                // @ts-ignore - MediaTypeOptions is deprecated but still works in this version
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: variant === 'profile',
                aspect: variant === 'profile' ? [1, 1] : aspect,
                quality,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                // If it's already a URL (not a local file), just set it
                if (!imageUri.startsWith('file://')) {
                    onChange(imageUri);
                    return;
                }

                // Upload the image
                setIsUploading(true);
                try {
                    const uploadedUrl = await uploadSingleImage(imageUri, folder);
                    onChange(uploadedUrl);
                    Toast.success('تم الرفع بنجاح', 'تم رفع الصورة بنجاح');
                } catch (error: any) {
                    console.error('Upload error:', error);
                    Toast.error('فشل الرفع', error?.message || 'حدث خطأ أثناء رفع الصورة');
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error: any) {
            console.error('Image picker error:', error);
            Toast.error('فشل الاختيار', error?.message || 'حدث خطأ أثناء اختيار الصورة');
            setIsUploading(false);
        }
    }, [variant, aspect, quality, folder]);

    const takePhoto = useCallback(async (onChange: (value: string) => void, currentValue: string) => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Toast.error('إذن مطلوب', 'يجب منح إذن الوصول إلى الكاميرا');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: variant === 'profile',
                aspect: variant === 'profile' ? [1, 1] : aspect,
                quality,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                // Upload the image
                setIsUploading(true);
                try {
                    const uploadedUrl = await uploadSingleImage(imageUri, folder);
                    onChange(uploadedUrl);
                    Toast.success('تم الرفع بنجاح', 'تم رفع الصورة بنجاح');
                } catch (error: any) {
                    console.error('Upload error:', error);
                    Toast.error('فشل الرفع', error?.message || 'حدث خطأ أثناء رفع الصورة');
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error: any) {
            console.error('Camera error:', error);
            Toast.error('فشل التقاط الصورة', error?.message || 'حدث خطأ أثناء التقاط الصورة');
            setIsUploading(false);
        }
    }, [variant, aspect, quality, folder]);

    const handleOptionSelect = useCallback((option: 'camera' | 'gallery') => {
        if (!fieldRef.current) return;
        
        setShowOptions(false);
        const { onChange, value } = fieldRef.current;
        
        if (option === 'camera') {
            takePhoto(onChange, value);
        } else {
            pickImage(onChange, value);
        }
    }, [takePhoto, pickImage]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => {
                // Store field reference to avoid re-renders
                fieldRef.current = { onChange, value };
                
                const imageUrl = value || '';
                const isLocalFile = imageUrl.startsWith('file://');

                return (
                    <View style={{ direction: 'rtl' }}>
                        {label && (
                            <Text className="text-sm font-semibold text-gray-900 mb-2 text-start">{label}</Text>
                        )}

                        <TouchableOpacity
                            onPress={() => !disabled && !isUploading && setShowOptions(true)}
                            disabled={disabled || isUploading}
                            activeOpacity={0.7}
                            className="relative"
                        >
                            <View
                                className={`${styles.container} bg-primary-100 items-center justify-center ${variant === 'rectangle' ? '' : ''
                                    }`}
                                style={{
                                    ...(variant === 'rectangle' && { height: styles.height }),
                                    shadowColor: '#E02020',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                {imageUrl ? (
                                    <>
                                        <Image
                                            source={{ uri: isLocalFile ? imageUrl : imageUrl }}
                                            className={styles.container}
                                            style={variant === 'rectangle' ? { height: styles.height } : {}}
                                            resizeMode="cover"
                                        />
                                        {isUploading && (
                                            <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-xl">
                                                <ActivityIndicator color="white" size="large" />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="image-outline" size={styles.iconSize} color="#E02020" />
                                        {isUploading && (
                                            <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-xl">
                                                <ActivityIndicator color="white" size="large" />
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>

                            {/* Camera/Edit Icon */}
                            <View
                                className={`absolute ${styles.cameraPosition} bg-primary-600 rounded-full p-2`}
                                style={{
                                    shadowColor: '#E02020',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 4,
                                }}
                            >
                                <Ionicons
                                    name={imageUrl ? "pencil" : "camera"}
                                    size={styles.cameraIconSize}
                                    color="white"
                                />
                            </View>

                            {/* Remove button */}
                            {imageUrl && !isUploading && (
                                <TouchableOpacity
                                    className="absolute top-2 left-2 bg-red-500 rounded-full p-2"
                                    onPress={() => onChange('')}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        {helperText && !error && (
                            <Text className="text-gray-500 text-xs mt-2 text-start">{helperText}</Text>
                        )}
                        {error && (
                            <Text className="text-red-500 text-sm mt-2 text-start">{error}</Text>
                        )}

                        {/* Image Source Selection Dialog */}
                        <Modal
                            visible={showOptions}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowOptions(false)}
                        >
                            <TouchableOpacity
                                className="flex-1 bg-black/50 items-center justify-center px-4"
                                activeOpacity={1}
                                onPress={() => setShowOptions(false)}
                            >
                                <Animated.View
                                    entering={FadeIn.duration(200)}
                                    exiting={FadeOut.duration(150)}
                                    className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                                    style={{ direction: 'rtl' }}
                                    onStartShouldSetResponder={() => true}
                                >
                                    <Text className="text-xl font-bold text-gray-900 text-start mb-4">
                                        {label || 'اختر صورة'}
                                    </Text>

                                    <TouchableOpacity
                                        className="flex-row items-center py-4 px-4 rounded-xl bg-gray-50 mb-3"
                                        onPress={() => handleOptionSelect('camera')}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="camera" size={24} color="#E02020" style={{ marginRight: 12 }} />
                                        <Text className="text-base text-gray-900 text-start flex-1">الكاميرا</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center py-4 px-4 rounded-xl bg-gray-50 mb-3"
                                        onPress={() => handleOptionSelect('gallery')}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="images" size={24} color="#E02020" style={{ marginRight: 12 }} />
                                        <Text className="text-base text-gray-900 text-start flex-1">المعرض</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center justify-center py-3 px-4 rounded-xl border-2 border-gray-200 mt-2"
                                        onPress={() => setShowOptions(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-base font-semibold text-gray-700">إلغاء</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                );
            }}
        />
    );
}

