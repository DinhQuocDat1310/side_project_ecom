import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrivateConversationInput } from './dto/create-chat.input';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';
import { UserSignIn } from 'src/auth/dto/auth';
import { Conversation, TypeConversation } from '@prisma/client';
import { ChatMessage } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  createPrivateConversation = async (
    user: UserSignIn,
    privateConversationInput: PrivateConversationInput,
  ): Promise<ChatMessage> => {
    const { title, participationUserId } = privateConversationInput;
    //First check user is existed
    const userExisted = await this.participationUserExisted(
      participationUserId,
    );
    if (!userExisted)
      throw new BadRequestException('Participant userId not found');
    // Second check the conversation with 2 users is established (Check 2 ways)
    const checkConversationExisted = await this.checkPrivateConversationExisted(
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
            `Private conversation of ${user.username} and ${userExisted.username}`,
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
          message: 'Your conversation created successfully',
        };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  participationUserExisted = async (userId: string) => {
    return await this.userService.getUserByID(userId);
  };

  checkPrivateConversationExisted = async (
    creatorId: string,
    participationUserId: string,
  ): Promise<boolean> => {
    try {
      const isCreator = await this.prismaService.conversation.findFirst({
        where: {
          creatorId,
          type: TypeConversation.PRIVATE,
          participant: {
            every: {
              participant: {
                userId: participationUserId,
              },
            },
          },
        },
      });
      const isParticipator = await this.prismaService.conversation.findFirst({
        where: {
          creatorId: participationUserId,
          type: TypeConversation.PRIVATE,
          participant: {
            every: {
              participant: {
                userId: creatorId,
              },
            },
          },
        },
      });
      if (isCreator || isParticipator) return true;
      return false;
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
