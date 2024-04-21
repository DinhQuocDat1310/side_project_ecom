import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ChatBotService } from './chat-bot.service';
import { ChatService } from 'src/chat/chat.service';

import { ChatBotMessage, ChatbotConversation, MessageChatBotData } from './entities/chat-bot.entity';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import {
  ChatbotConversationInput,
  CreateChatBotMessageInput} from './dto/create-chat-bot.input';

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


  @Mutation(() => MessageChatBotData)
  async createChatBotMessage(
    @Context() context: any,
    @Args('createChatBotMessageInput')
    createChatBotMessageInput: CreateChatBotMessageInput,
  ) {
    return await this.chatBotService.createMessage(
      context.req.user,
      createChatBotMessageInput,
    );
  }

  @Query(() => [MessageChatBotData], { name: 'messages' })
  async getAllMessageByChatBotConversationID(
    @Context() context: any,
    @Args('conversationID', { type: () => String }) conversationID: string,
  ) {
    return await this.chatBotService.getAllMessageOfConversationID(
      context.req.user,
      conversationID,
    );
  }  
}
