import { apiClient } from '@/services/api/apiClient';

export interface UploadedFileInfo {
    url: string;
    path: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
}

export interface UploadResponse {
    files?: UploadedFileInfo[];
    count?: number;
    folder?: string;
}

/**
 * Upload single or multiple images using the storage API
 * @param imageUris Array of local file URIs (file://...)
 * @param folder Folder name to organize files (default: 'general')
 * @returns Array of uploaded file URLs
 */
export const uploadImages = async (
    imageUris: string[],
    folder: string = 'general'
): Promise<string[]> => {
    if (!imageUris || imageUris.length === 0) {
        return [];
    }

    try {
        const formData = new FormData();

        // Add folder parameter
        formData.append('folder', folder);

        // Add all images
        imageUris.forEach((uri, index) => {
            // Ensure URI is in correct format for React Native
            let fileUri = uri;
            // If URI doesn't start with file://, add it (for consistency)
            if (!fileUri.startsWith('file://') && !fileUri.startsWith('http://') && !fileUri.startsWith('https://')) {
                fileUri = `file://${fileUri}`;
            }

            const filename = uri.split('/').pop() || `image_${index}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // For React Native, FormData needs this specific format
            // React Native FormData expects: { uri, type, name }
            formData.append('files', {
                uri: fileUri,
                type: type,
                name: filename,
            } as any);
        });

        if (__DEV__) {
            console.log('[ImageUpload] Uploading images:', {
                count: imageUris.length,
                folder,
                firstUri: imageUris[0]?.substring(0, 50) + '...',
                formDataKeys: Array.from((formData as any)._parts?.map((p: any) => p[0]) || []),
            });
        }

        const response = await apiClient.uploadFile<UploadedFileInfo | UploadResponse>(
            '/storage/upload',
            formData
        );

        if (__DEV__) {
            console.log('[ImageUpload] Upload response:', response);
        }

        // Handle response - API returns single file object or array with files
        if (response.data) {
            // Check if it's a single file (has url property directly)
            if ('url' in response.data && typeof (response.data as any).url === 'string') {
                return [(response.data as UploadedFileInfo).url];
            }
            // Check if it's multiple files (has files array)
            if ('files' in response.data && Array.isArray((response.data as any).files)) {
                const uploadResponse = response.data as UploadResponse;
                return uploadResponse.files?.map((file) => file.url) || [];
            }
        }

        console.warn('Unexpected upload response format:', response);
        return [];
    } catch (error: any) {
        console.error('Failed to upload images:', error);
        
        // Provide more detailed error message
        let errorMessage = 'فشل رفع الصور';
        
        if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
            errorMessage = 'خطأ في الاتصال بالشبكة. يرجى التحقق من:\n• اتصال الإنترنت\n• أن الـ API server يعمل\n• أن الـ IP address صحيح في الإعدادات';
        } else if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
            errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى';
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

/**
 * Upload a single image
 * @param imageUri Local file URI (file://...)
 * @param folder Folder name to organize files (default: 'general')
 * @returns Uploaded file URL
 */
export const uploadSingleImage = async (
    imageUri: string,
    folder: string = 'general'
): Promise<string> => {
    const urls = await uploadImages([imageUri], folder);
    return urls[0] || '';
};

