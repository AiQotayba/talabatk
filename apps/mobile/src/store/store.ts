import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import ordersReducer from './slices/orders.slice';
import locationReducer from './slices/location.slice';
import messagesReducer from './slices/messages.slice';
import notificationsReducer from './slices/notifications.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    location: locationReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


