import { UserService } from './../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';
import { hash } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  githubLogin = async (code: string): Promise<any> => {
    if (!code) {
      throw new UnauthorizedException('No user from GitHub');
    }
    const params = "?client_id=" + process.env.GITHUB_CLIENT_ID  + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET + "&code=" + code;
    const data = await fetch("https://github.com/login/oauth/access_token"+ params,{
      method:"POST",
      headers:{
        "Accept":"application/json"
      }
    })
    console.log(data)
  };
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

  generate_token = async (user: User) => {
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
