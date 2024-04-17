import { Socket } from 'socket.io';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') return true;
    const client: Socket = context.switchToWs().getClient();
    WsJwtGuard.validateToken(client);
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    if (!authorization) throw new UnauthorizedException();
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_JWT_SECRET_KEY);
    return payload;
  }
}
