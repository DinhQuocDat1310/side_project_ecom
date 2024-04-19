import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatMessage, Conversation, MessageData } from './entities/chat.entity';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import {
  CreateMessageInput,
  GroupConversationInput,
  PrivateConversationInput,
} from './dto/create-chat.input';

@Resolver()
@UseGuards(AccessJwtAuthGuard)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => ChatMessage)
  async createPrivateConversation(
    @Context() context: any,
    @Args('privateConversationInput')
    privateConversationInput: PrivateConversationInput,
  ) {
    return await this.chatService.createPrivateConversation(
      context.req.user,
      privateConversationInput,
    );
  }

  @Query(() => [Conversation], { name: 'conversation' })
  findOne(@Context() context: any) {
    return this.chatService.getConversationOfCreator(context.req.user);
  }

  @Mutation(() => ChatMessage)
  async createGroupConversation(
    @Context() context: any,
    @Args('groupConversationInput')
    groupConversationInput: GroupConversationInput,
  ) {
    return await this.chatService.createGroupConversation(
      context.req.user,
      groupConversationInput,
    );
  }

  @Mutation(() => MessageData)
  async createMessage(
    @Context() context: any,
    @Args('createMessageInput')
    createMessageInput: CreateMessageInput,
  ) {
    return await this.chatService.createMessage(
      context.req.user,
      createMessageInput,
    );
  }

  @Query(() => [MessageData], { name: 'messages' })
  async getAllMessageByConversationID(
    @Context() context: any,
    @Args('conversationID', { type: () => String }) conversationID: string,
  ) {
    return await this.chatService.getAllMessageOfConversationID(
      context.req.user,
      conversationID,
    );
  }

  // @ApiBody({ type: MessageDTO })
  // @Post('')
  // async createMessage(@Request() userReq: any, @Body() messageDto: MessageDTO) {
  //   const message = await this.messagesService.createMessage(
  //     userReq.user,
  //     messageDto,
  //   );
  //   //Emit Event: message.create
  //   //Emit Data: message
  //   this.eventEmitter.emit('message.create', message);
  //   return message;
  // }
}
