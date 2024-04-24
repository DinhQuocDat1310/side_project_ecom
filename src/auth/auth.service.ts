import { UserService } from './../user/user.service';
import { GitHubCode, UserSignInWithRfToken } from './dto/auth';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';
import { hash, compare } from 'bcrypt';
import axios from 'axios';
import {
  AuthAccessToken,
  AuthMessage,
  AuthToken,
} from './entities/auth.entity';
import { UserSignIn } from './dto/auth';
import fetch from 'node-fetch';
import { Gender, Role } from '@prisma/client';
import { LangchainService } from 'src/langchain/langchain.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  getGitHubAccessToken = async (gitHubCode: GitHubCode): Promise<any> => {
    const { codeAuth }: GitHubCode = gitHubCode;
    if (!codeAuth) {
      throw new UnauthorizedException('No user from GitHub');
    }
    const params =
      '?client_id=' +
      process.env.GITHUB_CLIENT_ID +
      '&client_secret=' +
      process.env.GITHUB_CLIENT_SECRET +
      '&code=' +
      codeAuth;
    try {
      const res = await fetch(
        'https://github.com/login/oauth/access_token' + params,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
        },
      ).then((response) => response.json());
      const access_token = res.access_token;
      return { codeAuth: access_token };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  githubLogin = async (gitHubCode: GitHubCode): Promise<any> => {
    try {
      // get Github access_token
      const data = await this.getGitHubAccessToken(gitHubCode);
      const access_token = data.codeAuth;
      if (!access_token) {
        throw new UnauthorizedException('Something wrong with GitHub');
      }
      // get Github user_profile
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
        },
      });

      const userGithub = response.data;
      const userName = userGithub.email;
      const password =
        'userGithub' + userGithub.login + userGithub.email + userGithub.id;
      // auth successfully
      if (userGithub) {
        const user = await this.validateUser(userName, password);
        // create
        if (user == null) {
          const UserSignIn = {
            username: userGithub.email,
            email: userGithub.email,
            password:
              'userGithub' +
              userGithub.login +
              userGithub.email +
              userGithub.id,
            phoneNumber: '',
            address: userGithub.location,
            role: Role.SALESMAN,
            gender: Gender.MALE,
            dateOfBirth: null,
            avatar: userGithub.avatar_url ? userGithub.avatar_url : ' ',
            provider: 'local',
          };
          //
          const createdUser = await this.userService.create(UserSignIn);
          delete createdUser.dateOfBirth;
          const dataLogin = {
            ...createdUser,
            dateOfBirth: ' ',
          };
          //
          const tokens = await this.login(dataLogin);
          return tokens;
          // login
        } else {
          const UserSignIn = user;
          const tokens = await this.login(UserSignIn);
          return tokens;
        }
      }
    } catch (error) {
      console.log('something wrong when signing in with github');
      console.error('Error:', error.response);
      throw error;
    }
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

  login = async (user: UserSignIn) => {
    try {
      const tokens: AuthToken = await this.generateToken(user);
      if (tokens) {
        user['hashedRefreshToken'] = tokens.refreshToken;
        await this.saveUserCreatedWithToken(user);
      }
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  generateToken = async (user: UserSignIn) => {
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

  logout = async (user: UserSignIn): Promise<AuthMessage> => {
    try {
      const getUser = await this.prismaService.auth.findFirst({
        where: {
          userId: user.id,
          hashedRefreshToken: {
            not: null,
          },
        },
      });
      if (!getUser) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid to logout',
        };
      }
      await this.prismaService.auth.update({
        where: {
          userId: getUser.userId,
        },
        data: {
          hashedRefreshToken: null,
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User logged out',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  refreshToken = async (
    userData: UserSignInWithRfToken,
  ): Promise<AuthAccessToken> => {
    const user = await this.prismaService.auth.findUnique({
      where: {
        userId: userData.id,
        hashedRefreshToken: {
          not: null,
        },
      },
    });
    if (!user) throw new UnauthorizedException();
    const compareRefreshToken = await compare(
      userData.refreshToken,
      user.hashedRefreshToken,
    );
    if (!compareRefreshToken) throw new UnauthorizedException();
    userData['is_refresh'] = true;
    const tokens: AuthToken = await this.generateToken(userData);
    return {
      accessToken: tokens.accessToken,
    };
  };
}
