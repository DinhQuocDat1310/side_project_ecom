import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatMessage, Conversation } from './entities/chat.entity';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import {
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

  // @Mutation(() => Chat)
  // createChat(@Args('createChatInput') createChatInput: CreateChatInput) {
  //   return this.chatService.create(createChatInput);
  // }

  // @Query(() => [Chat], { name: 'chat' })
  // findAll() {
  //   return this.chatService.findAll();
  // }

  // @Query(() => Chat, { name: 'chat' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.chatService.findOne(id);
  // }

  // @Mutation(() => Chat)
  // updateChat(@Args('updateChatInput') updateChatInput: UpdateChatInput) {
  //   return this.chatService.update(updateChatInput.id, updateChatInput);
  // }

  // @Mutation(() => Chat)
  // removeChat(@Args('id', { type: () => Int }) id: number) {
  //   return this.chatService.remove(id);
  // }
}
