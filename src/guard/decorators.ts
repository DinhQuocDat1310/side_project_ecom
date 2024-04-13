import { SetMetadata } from '@nestjs/common';
import { Role, StatusUser } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const STATUS_KEY = 'status';
export const Status = (...status: StatusUser[]) =>
  SetMetadata(STATUS_KEY, status);
