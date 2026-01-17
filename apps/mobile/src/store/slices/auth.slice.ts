import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/services/api/apiClient';
import { AuthState, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth.types';
import { STORAGE_KEYS } from '@/utils/constants';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

// Load auth state from storage
export const loadAuthState = createAsyncThunk('auth/loadState', async () => {
  try {
    const [accessToken, refreshToken, userData] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA),
    ]);

    if (accessToken && userData) {
      return {
        accessToken,
        refreshToken,
        user: JSON.parse(userData) as User,
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading auth state:', error);
    return null;
  }
});

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { access_token, refresh_token, user } = (response.data as AuthResponse) || response;
      // Store tokens and user data
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh_token),
        SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);

      return { accessToken: access_token, refreshToken: refresh_token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      const { access_token, refresh_token, user } = (response.data as AuthResponse) || response;

      // Store tokens and user data
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh_token),
        SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);

      return { accessToken: access_token, refreshToken: refresh_token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Update Profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { name?: string; email?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ user: User }>('/users/profile', data);
      const user = response.data?.user || (response.data as any)?.user;

      if (user) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Update profile failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
  ]);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
    },
    updateProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load auth state
      .addCase(loadAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadAuthState.rejected, (state) => {
        state.isLoading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.isLoading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, updateProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;


