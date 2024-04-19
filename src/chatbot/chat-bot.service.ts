import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ChatbotConversationInput
} from './dto/create-chat-bot.input';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';
import { UserSignIn } from 'src/auth/dto/auth';
import { Conversation, MemberRole, TypeConversation } from '@prisma/client';
import { ChatBotMessage } from './entities/chat-bot.entity';
import mongoose from 'mongoose';

@Injectable()
export class ChatBotService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  createChatBotConversation = async (
    user: UserSignIn,
    chatbotConversationInput: ChatbotConversationInput,
  ): Promise<ChatBotMessage> => {
    const { title, participationUserId } = chatbotConversationInput;
    //First check format ObjectID
    await this.chatService.isValidObjectID(participationUserId);
    //First check user is existed
    const userExisted = await this.chatService.participationUserExisted(
      participationUserId,
    );
    if (!userExisted)
      throw new BadRequestException('Participant userId not found');
    // Second check the conversation with 2 users is established (Check 2 ways)
    const checkConversationExisted = await this.chatService.checkPrivateConversationExisted(
      user.id,
      participationUserId,
    );
    if (checkConversationExisted)
      throw new BadRequestException(
        `Your conversation with ${userExisted.username} is already established`,
      );
    try {
      const conversation = await this.prismaService.conversation.create({
        data: {
          title:
            title ??
            `Chatbot conversation of ${user.username} and ${userExisted.username}`,
          creatorId: user.id,
          type: TypeConversation.PRIVATE,
          participant: {
            create: {
              participant: {
                create: {
                  userId: participationUserId,
                },
              },
            },
          },
        },
      });
      if (conversation)
        return {
          statusCode: HttpStatus.OK,
          message: 'Your private conversation created successfully',
        };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
  getConversationOfCreator = async (
    user: UserSignIn,
  ): Promise<Conversation[]> => {
    try {
      const conversation = await this.prismaService.conversation.findMany({
        where: {
          creatorId: user.id,
        },
      });
      if (conversation) return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
}
