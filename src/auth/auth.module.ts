import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGitHubResolver, AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma/service';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenJwtStrategy } from './strategies/refresh-token-jwt.strategy';
import { AccessTokenJwtStrategy } from './strategies/access-token-jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';
import { LangchainService } from 'src/langchain/langchain.service';
@Module({
  imports: [PassportModule],
  providers: [
    AuthGitHubResolver,
    AuthResolver,
    AuthService,
    PrismaService,
    LocalStrategy,
    RefreshTokenJwtStrategy,
    AccessTokenJwtStrategy,
    ConfigService,
    UserService,
    JwtService,
    ChatService,
    LangchainService,

  ],
})
export class AuthModule {}
