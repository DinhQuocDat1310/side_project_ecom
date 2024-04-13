import { UserService } from './../user/user.service';
import { GitHubCode } from './dto/auth';
import { Injectable, InternalServerErrorException ,UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';
import { hash } from 'bcrypt';
import axios from 'axios';
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

  getGitHubAccessToken = async (gitHubCode: GitHubCode): Promise<any> => {
    const {
      codeAuth
    }: GitHubCode = gitHubCode;
    if (!codeAuth) {
      throw new UnauthorizedException('No user from GitHub');
    }
    console.log(codeAuth)
    const params = "?client_id=" + process.env.GITHUB_CLIENT_ID  + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET + "&code=" + codeAuth;
    try {
      // Your params here
      // const response = await axios.post('https://github.com/login/oauth/access_token' + params, {
      //   headers: {
      //     'Accept': 'application/json',
      //   }
      // });
      const res = await fetch('https://github.com/login/oauth/access_token'+params, {
        method: "POST",
        headers: {
              'Accept': "application/json"
        }}).then((response) => response.json());
      const access_token  = res.access_token;
      return { codeAuth : access_token };   
     } catch (error) {
      console.error('Error:', error.response);
      throw error;
    }
  };
  
  githubLogin = async (gitHubCode: GitHubCode): Promise<any> => {
   try {
     const data = await this.getGitHubAccessToken(gitHubCode)
     const access_token = data.codeAuth;
     console.log(access_token)
     if(!access_token){
      throw new UnauthorizedException('Something wrong with GitHub');
     }
     const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });

    console.log('GitHub API Response:', response);
    const userGithub = response;
    const userName = userGithub.data.login;
    console.log("userGithub.data",userGithub.data)
    const GitHubAuth =  { codeAuth: " ", user:  {
      username: userName,
      email: userGithub.data.email,
      password: 'password123',
      phoneNumber: '1234567890',
      address: '123 Main St, City, Country',
      role: "ADMIN",
      gender: "MALE",
      dateOfBirth: '1990-01-01',
      avatar: 'https://example.com/avatar.jpg',
      provider: 'local' // Assuming this is the default provider
    }}
    const returnData = GitHubAuth
    return returnData
   } catch (error) {
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
