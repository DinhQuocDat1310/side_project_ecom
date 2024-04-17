import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GroupConversationInput,
  PrivateConversationInput,
} from './dto/create-chat.input';
import { PrismaService } from 'src/prisma/service';
import { UserService } from 'src/user/user.service';
import { UserSignIn } from 'src/auth/dto/auth';
import { Conversation, MemberRole, TypeConversation } from '@prisma/client';
import { ChatMessage } from './entities/chat.entity';
import mongoose from 'mongoose';

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
    //First check format ObjectID
    await this.isValidObjectID(participationUserId);
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
          message: 'Your private conversation created successfully',
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

  isValidObjectID = async (objectId: string | Array<string>) => {
    const validateObjectId = (id: string) => {
      const isValidObjectID: boolean = mongoose.Types.ObjectId.isValid(id);
      if (!isValidObjectID)
        throw new InternalServerErrorException(
          'Your ObjectID provided hex string must be exactly 12 bytes. Please try again.',
        );
    };
    if (typeof objectId === 'string') {
      validateObjectId(objectId);
    } else {
      objectId.forEach(validateObjectId);
    }
  };

  createGroupConversation = async (
    user: UserSignIn,
    groupConversationInput: GroupConversationInput,
  ) => {
    const { participationUserId, title } = groupConversationInput;
    //First check format ObjectID
    await this.isValidObjectID(participationUserId);
    //Second check validation for Group Conversation
    await this.validationGroupConversation(user.id, groupConversationInput);
    //Pass
    try {
      const conversation = await this.prismaService.conversation.create({
        data: {
          creatorId: user.id,
          title: title ?? `Group conversation of ${user.username}`,
          type: TypeConversation.GROUP,
        },
      });
      if (conversation)
        await Promise.all(
          participationUserId.map(async (userId) => {
            return await this.prismaService.conversation.update({
              where: {
                id: conversation.id,
              },
              data: {
                participant: {
                  create: {
                    participant: {
                      create: {
                        userId,
                        memberRole: MemberRole.MEMBER,
                      },
                    },
                  },
                },
              },
            });
          }),
        );
      return {
        statusCode: HttpStatus.OK,
        message: 'Your group conversation created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  validationGroupConversation = async (
    creatorId: string,
    groupConversationInput: GroupConversationInput,
  ) => {
    //First check the conversation is existed with fully Participators
    const conversation =
      await this.checkGroupConversationExistedWithParticipator(
        creatorId,
        groupConversationInput,
      );
    if (conversation)
      throw new BadRequestException(
        'Your conversation with all participants was established',
      );

    //Second check each participator ID existed
    const userExistedChecks = await Promise.all(
      groupConversationInput.participationUserId.map(async (userId) => {
        return await this.participationUserExisted(userId);
      }),
    );
    const userExited = userExistedChecks.every((result) => result);
    if (!userExited)
      throw new BadRequestException('Participant userId not found');
  };

  checkGroupConversationExistedWithParticipator = async (
    creatorId: string,
    groupConversationInput: GroupConversationInput,
  ) => {
    try {
      const { participationUserId, title } = groupConversationInput;
      //Get all participators belongs to the conversation of current user (Logging in User)
      //Condition: Same Title and Type Group
      //Output: The userId
      const conversation = await this.prismaService.conversation.findFirst({
        where: {
          creatorId,
          title,
          type: TypeConversation.GROUP,
        },
        select: {
          participant: {
            select: {
              participant: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      //First filter: Output new list contain all userId (Not null - Not Undefined)
      //Second filter: Output new list keeps all item which userId inside participationUserId
      const listParticipators = conversation?.participant
        .filter((participate) => participate.participant.userId)
        .filter((user) =>
          participationUserId.includes(user?.participant?.userId),
        );
      //Check if already existing conversation => True else False
      if (!listParticipators && !conversation?.participant) return false;
      if (listParticipators?.length === conversation?.participant?.length)
        return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
}
