import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ChatResolver, ChatService, PrismaService, UserService],
})
export class ChatModule {}
