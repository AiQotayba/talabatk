import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationState {
  currentLocation: Location | null;
  driverLocation: Location | null;
  hasPermission: boolean | null;
  isTracking: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  driverLocation: null,
  hasPermission: null,
  isTracking: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    setDriverLocation: (state, action: PayloadAction<Location | null>) => {
      state.driverLocation = action.payload;
    },
    setHasPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
    setIsTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
      state.driverLocation = null;
    },
  },
});

export const {
  setCurrentLocation,
  setDriverLocation,
  setHasPermission,
  setIsTracking,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;


