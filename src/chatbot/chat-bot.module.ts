import { Module } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { ChatResolver } from './chat-bot.resolver';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ChatResolver, ChatBotService, PrismaService, UserService],
})
export class ChatModule {}
