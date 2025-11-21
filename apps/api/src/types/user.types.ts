export interface UpdateProfileRequest {
  name?: string;
  profile_photo_url?: string;
}

export interface CreateAddressRequest {
  city: string;
  street: string;
  label: string;
  lat: number;
  lng: number;
  is_default?: boolean;
  notes?: string;
  building_number?: string;
  building_image_url?: string;
  door_image_url?: string;
}

export interface UpdateAddressRequest {
  city?: string;
  street?: string;
  label?: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
  notes?: string;
  building_number?: string;
  building_image_url?: string;
  door_image_url?: string;
}
