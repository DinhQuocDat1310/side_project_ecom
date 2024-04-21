import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ChatbotConversationInput,
  CreateChatBotMessageInput,
} from './dto/create-chat-bot.input';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';
import { UserSignIn } from 'src/auth/dto/auth';
import {
  Conversation,
  MemberRole,
  MessageStatus,
  TypeConversation,
} from '@prisma/client';
import { ChatBotMessage, MessageChatBotData } from './entities/chat-bot.entity';
import mongoose from 'mongoose';
import { LangchainService } from 'src/langchain/langchain.service';
import { HumanMessage } from 'src/langchain/dto/langchain.input';

@Injectable()
export class ChatBotService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly langchainService: LangchainService,
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
    const checkConversationExisted =
      await this.chatService.checkPrivateConversationExisted(
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
  createMessage = async (
    user: UserSignIn,
    createChatBotMessageInput: CreateChatBotMessageInput,
  ): Promise<MessageChatBotData> => {
    try {

      const { messageText, conversationId } = createChatBotMessageInput;
      await this.chatService.checkAllConversationExisted(
        user.id,
        conversationId,
      );
      // get ai message
      const HumanMessage = {
        message: messageText,
      };
      const res = await this.langchainService.query(HumanMessage);
      const chatBotMessage = res.message;
      // handle message
      const message = await this.prismaService.$transaction(
        async (prisma: PrismaService) => {
          return await prisma.message.create({
            data: {
              sender: {
                connect: {
                  id: user.id,
                },
              },
              message: messageText,
              // AI message
              chatBotMessage: chatBotMessage,
              messageStatus: MessageStatus.SEND,
              conversation: {
                connect: {
                  id: conversationId,
                },
              },
            },
            select: {
              id: true,
              message: true,
              chatBotMessage: true,
              messageStatus: true,
              senderId: true,
              conversationId: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
          });
        },
      );
      return message;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
  getAllMessageOfConversationID = async (
    user: UserSignIn,
    conversationID: string,
  ): Promise<Array<MessageChatBotData>> => {
    const conversation = await this.chatService.checkAllConversationExisted(
      user.id,
      conversationID,
    );
    if (conversation) {
      const messages = await this.prismaService.message.findMany({
        where: {
          conversationId: conversation.id,
        },
      });
      return messages;
    }
  };
}
