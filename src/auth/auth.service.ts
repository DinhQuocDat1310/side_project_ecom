import { UserService } from './../user/user.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';
import { hash } from 'bcrypt';
import { CreateLoginAuthInput } from './dto/create-auth.input';
import { AuthToken } from './entities/auth.entity';
import { UserSignIn } from './dto/auth';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  validateUser = async (username: string, password: string): Promise<any> => {
    // Check username and password
    return await this.userService.checkValidateUser({
      username: username,
      password: password,
    });
  };

  getUserByEmailorPhonenumber = async (username: string): Promise<any> => {
    return await this.userService.findUserByEmailOrPhoneNumber(username);
  };

  saveUserCreatedWithToken = async (dataUser: any): Promise<any> => {
    const user = await this.prismaService.auth.findFirst({
      where: {
        userId: dataUser.id,
      },
    });
    const hashedRefreshToken = await hash(dataUser.hashedRefreshToken, 10);
    return user
      ? await this.prismaService.auth.update({
          where: {
            userId: dataUser.id,
          },
          data: {
            hashedRefreshToken,
          },
        })
      : await this.prismaService.auth.create({
          data: {
            userId: dataUser.id,
            hashedRefreshToken,
          },
        });
  };

  login = async (user: UserSignIn) => {
    try {
      const tokens: AuthToken = await this.generate_token(user);
      if (tokens) {
        user['hashedRefreshToken'] = tokens.refreshToken;
        await this.saveUserCreatedWithToken(user);
      }
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  generate_token = async (user: UserSignIn) => {
    const payload = {
      username: user.email ? user.email : user.phoneNumber,
      sub: user.id,
    };
    const generateTokenType = [];
    const accessTokenType = this.jwtService.signAsync(payload, {
      secret: this.configService.get('ACCESS_TOKEN_JWT_SECRET_KEY'),
      expiresIn: 60 * 60 * 24, // 24 hours
    });
    const refreshTokenType = this.jwtService.signAsync(payload, {
      secret: this.configService.get('REFRESH_TOKEN_JWT_SECRET_KEY'),
      expiresIn: 60 * 60 * 24 * 7, //7 days
    });

    user['is_refresh']
      ? generateTokenType.push(accessTokenType)
      : generateTokenType.push(accessTokenType, refreshTokenType);

    const [accessToken, refreshToken] = await Promise.all(generateTokenType);
    return {
      accessToken,
      refreshToken,
    };
  };
}
