import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';
import { ApiError, ApiResponse } from '@/types/api.types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // For file uploads (FormData), handle differently
        if (config.data instanceof FormData) {
          // Remove Content-Type to let React Native set it with boundary
          if (config.headers) {
            delete config.headers['Content-Type'];
            delete (config.headers as any)['content-type'];
            delete config.headers['Accept'];
          }
          // Don't add request ID for file uploads to avoid issues
        } else {
          // Add request ID for tracking (only for non-file uploads)
          config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Add auth token
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log in development
        if (__DEV__) {
          // console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          //   data: config.data instanceof FormData ? '[FormData]' : config.data,
          //   params: config.params,
          //   headers: config.data instanceof FormData ? 'FormData headers handled by RN' : config.headers,
          // });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          // console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          //   status: response.status,
          //   data: response.data,
          // });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // Try to refresh token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data.data || response.data;
            if (access_token) {
              await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
              }

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
            
            // Redirect to login will be handled by auth state
            return Promise.reject(refreshError);
          }
        }

        // Format error
        const apiError: ApiError = {
          message: (error.response?.data as { message?: string })?.message || error.message || 'An error occurred',
          status: error.response?.status,
          errors: (error.response?.data as { errors?: Record<string, string[]> })?.errors,
        };

        if (__DEV__) {
          console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, apiError);
        }

        return Promise.reject(apiError);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload helper
  async uploadFile<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Get auth token for file upload
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    
    // Build headers - critical for React Native FormData
    const headers: any = {
      Authorization: token ? `Bearer ${token}` : undefined,
      // DO NOT set Content-Type - React Native will set it automatically with boundary
      // DO NOT set Accept header for file uploads
    };
    
    // Remove any Content-Type or Accept headers to let React Native handle it
    delete headers['Content-Type'];
    delete headers['content-type'];
    delete headers['Accept'];
    delete headers['accept'];
    
    // Merge with any custom headers from config (but still remove Content-Type)
    if (config?.headers) {
      Object.keys(config.headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey !== 'content-type' && lowerKey !== 'accept') {
          headers[key] = (config.headers as any)[key];
        }
      });
    }
    
    // Create a fresh axios instance for file uploads to avoid interceptor issues
    const uploadClient = axios.create({
      baseURL: this.client.defaults.baseURL,
      timeout: config?.timeout || 120000, // 120 seconds for file uploads (increased from 60)
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors, let us handle them
    });
    
    // Add auth token to headers
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const fullUrl = `${this.client.defaults.baseURL}${url}`;
      
      if (__DEV__) {
        console.log('[Upload] Starting upload request:', {
          url: fullUrl,
          hasFormData: formData instanceof FormData,
          hasToken: !!token,
        });
      }

      // Make request directly without interceptors that might interfere
      const response = await uploadClient.post<ApiResponse<T>>(
        url,
        formData,
        {
          ...config,
          headers,
          transformRequest: (data, requestHeaders) => {
            // Remove Content-Type header if it exists - React Native will set it
            if (requestHeaders) {
              delete requestHeaders['Content-Type'];
              delete (requestHeaders as any)['content-type'];
              delete requestHeaders['Accept'];
              delete (requestHeaders as any)['accept'];
            }
            // Return FormData as-is - React Native will handle it
            return data;
          },
        }
      );
      
      if (__DEV__) {
        console.log('[Upload] Success:', {
          status: response.status,
          data: response.data,
        });
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error logging for debugging
      const fullUrl = `${this.client.defaults.baseURL}${url}`;
      
      if (__DEV__) {
        console.error('[Upload Error]', {
          url,
          fullUrl,
          error: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          request: error.request,
          isNetworkError: error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'),
          isTimeout: error.code === 'ECONNABORTED' || error.message?.includes('timeout'),
        });
      }
      
      // Provide better error message
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        const networkError = new Error(
          `خطأ في الاتصال بالشبكة. يرجى التحقق من:\n1. اتصال الإنترنت\n2. أن الـ API server يعمل على ${fullUrl}\n3. أن الـ IP address صحيح`
        );
        (networkError as any).code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        const timeoutError = new Error('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى');
        (timeoutError as any).code = 'TIMEOUT';
        throw timeoutError;
      }
      
      throw error;
    }
  }
}

export const apiClient = new ApiClient();


