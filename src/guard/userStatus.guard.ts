import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatusUser } from '@prisma/client';
import { STATUS_KEY } from './decorators';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireStatus = this.reflector.get<StatusUser[]>(
      STATUS_KEY,
      context.getHandler(),
    );
    if (!requireStatus) {
      return true;
    }
    const ctx: any = context.switchToHttp().getNext();
    const userData = !ctx.user ? ctx.req.user : ctx.user;

    const isValid = requireStatus.some((status) => status === userData.status);
    if (!isValid)
      throw new ForbiddenException(
        `Your account is don't have permission to access this resource`,
      );
    return isValid;
  }
}
