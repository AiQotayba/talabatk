import { UserRole } from '@prisma/client';

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string; 
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: UserRole;
    profile_photo_url: string | null;
  };
}
