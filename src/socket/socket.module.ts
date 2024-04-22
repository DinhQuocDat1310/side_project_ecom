import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';

@Module({
  providers: [
    SocketGateway,
    SocketService,
    AuthService,
    PrismaService,
    ConfigService,
    JwtService,
    UserService,
    ChatService,
  ],
})
export class SocketModule {}
