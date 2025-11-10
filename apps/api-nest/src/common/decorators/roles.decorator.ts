import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Define UserRole type until Prisma client is generated
export type UserRole = 'client' | 'driver' | 'admin';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
