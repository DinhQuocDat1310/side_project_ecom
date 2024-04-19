import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ChatBotService } from './chat-bot.service';
import { ChatService } from 'src/chat/chat.service';

import { ChatBotMessage, ChatbotConversation } from './entities/chat-bot.entity';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import {
  ChatbotConversationInput
} from './dto/create-chat-bot.input';

@Resolver()
@UseGuards(AccessJwtAuthGuard)
export class ChatBotResolver {
  constructor(
    private readonly chatBotService: ChatBotService) {}

  @Mutation(() => ChatBotMessage)
  async createChatBotConversation(
    @Context() context: any,
    @Args('chatbotConversationInput')
    chatbotConversationInput: ChatbotConversationInput,
  ) {
    return await this.chatBotService.createChatBotConversation(
      context.req.user,
      chatbotConversationInput,
    );
  }

  @Query(() => [ChatbotConversation], { name: 'conversation' })
  findOne(@Context() context: any) {
    return this.chatBotService.getConversationOfCreator(context.req.user);
  }

  
}
