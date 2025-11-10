export type OrderStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface Address {
  id: string;
  user_id: string;
  city: string;
  street: string;
  label?: string;
  lat: number;
  lng: number;
  is_default: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  client_id: string;
  driver_id?: string;
  status: OrderStatus;
  content: string;
  dropoff_address_id: string;
  dropoff_address?: Address;
  payment_method: string;
  proof_urls?: string[];
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    profile_photo_url?: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    profile_photo_url?: string;
  };
}

export interface CreateOrderRequest {
  content: string;
  dropoff_address_id: string; 
  attachments?: string[];
}


