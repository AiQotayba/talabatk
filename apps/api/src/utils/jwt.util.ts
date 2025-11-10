import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload } from '../types/auth.types';

export const generateAccessToken = (payload: { sub: string; role: string }): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = (payload: { sub: string; role: string }): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
};
