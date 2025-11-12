import { OrderStatus, UserRole } from '@prisma/client';

export interface CreateOrderRequest {
  content: string;
  dropoff_address_id: string;
  payment_method?: 'cash' | 'card';
  pickup_lat?: number;
  pickup_lng?: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  pickup_lat?: number;
  pickup_lng?: number;
}

export interface OrderHistoryQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface NearbyDriversQuery {
  lat: number;
  lng: number;
  radius?: number; // in kilometers
}

export interface OrderTrackingResponse {
  order: {
    id: string;
    code_order: string;
    status: OrderStatus;
    content: string;
    created_at: Date;
    actual_pickup_at: Date | null;
    delivered_at: Date | null;
    pickup_lat: number | null;
    pickup_lng: number | null;
  };
  client: {
    id: string;
    name: string | null;
    phone: string | null;
  };
  driver?: {
    id: string;
    name: string | null;
    phone: string | null;
    current_location?: {
      lat: number;
      lng: number;
    };
  };
  address: {
    city: string | null;
    street: string | null;
    lat: number | null;
    lng: number | null;
  };
}
