import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadDTO } from '../dto/auth';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_JWT_SECRET_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: PayloadDTO) {
    const user = await this.authService.getUserByEmailorPhonenumber(
      payload.username,
    );
    if (!user) throw new UnauthorizedException();
    return {
      ...user,
      refreshToken: req.get('Authorization').replace('Bearer', '').trim(),
    };
  }
}
