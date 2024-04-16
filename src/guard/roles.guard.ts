import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './decorators';
import { RequestUser } from 'src/auth/dto/auth';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requireRoles) {
      return true;
    }
    const ctx: any = context.switchToHttp().getNext();
    const userData = !ctx.user ? ctx.req.user : ctx.user;

    const isValid = requireRoles.some((role) => role === userData.role);
    if (!isValid) {
      throw new ForbiddenException(
        `Your ${userData.role} role is don't have permisson to access this resource`,
      );
    }

    return isValid;
  }
}
