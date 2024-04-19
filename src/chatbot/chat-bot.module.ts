import { Module } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { ChatBotResolver } from './chat-bot.resolver';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';

@Module({
  providers: [ChatBotResolver, ChatBotService, PrismaService, UserService, ChatService],
})
export class ChatBotModule {}
