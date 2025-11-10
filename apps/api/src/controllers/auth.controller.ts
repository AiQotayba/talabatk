import { Response } from 'express';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/common.types';
import { RegisterRequest, LoginRequest, RefreshTokenRequest } from '../types/auth.types';
import prisma from '../config/database';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      sendError(res, 'User with this email or phone already exists', 400);
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        hashed_password: hashedPassword,
        role: "admin"
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_photo_url: true,
        created_at: true,
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ sub: user.id, role: "client" });
    const refreshToken = generateRefreshToken({ sub: user.id, role: "client" });

    sendSuccess(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      user
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.hashed_password) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.hashed_password);
    if (!isValidPassword) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, role: user.role });

    sendSuccess(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_photo_url: user.profile_photo_url,
      }
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refresh_token }: RefreshTokenRequest = req.body;

    if (!refresh_token) {
      sendError(res, 'Refresh token required', 400);
      return;
    }

    // Verify refresh token
    const { generateAccessToken, verifyRefreshToken } = await import('../utils/jwt.util');
    const decoded = verifyRefreshToken(refresh_token);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
        profile_photo_url: true,
      }
    });

    if (!user) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({ sub: user.id, role: user.role });

    sendSuccess(res, {
      access_token: newAccessToken,
      user
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    sendError(res, 'Invalid refresh token', 401);
  }
};
