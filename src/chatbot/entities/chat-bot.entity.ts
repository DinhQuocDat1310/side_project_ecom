import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MessageStatus, TypeConversation } from '@prisma/client';

@ObjectType()
export class ChatbotConversation {
  @Field(() => String, { description: 'Chatbot Conversation ID' })
  id: string;
  @Field(() => String, { description: 'Title' })
  title: string;
  @Field(() => String, { description: 'Type Conversation' })
  type: TypeConversation;
  @Field(() => String, { description: 'Creator ID' })
  creatorId: string;
  @Field(() => Date, { description: 'Created at' })
  createdAt: String;
  @Field(() => Date, { description: 'Updated at' })
  updatedAt: String;
}

@ObjectType()
export class ChatBotMessage {
  @Field(() => String, { description: 'Response message chat' })
  message: string;
  @Field(() => Int, { description: 'Response status code' })
  statusCode: number;
}

@ObjectType()
export class MessageChatBotData {
  @Field(() => String, { description: 'Message ID' })
  id: string;
  @Field(() => String, { description: 'Message text' })
  message: string;
  @Field(() => String, { description: 'Message text' })
  chatBotMessage: string;
  @Field(() => MessageStatus, { description: 'Status' })
  messageStatus: MessageStatus;
  @Field(() => String, { description: 'Sender ID' })
  senderId: string;
  @Field(() => String, { description: 'Conversation ID' })
  conversationId: string;
  @Field(() => Date, { description: 'Created at' })
  createdAt: Date;
  @Field(() => Date, { nullable: true, description: 'Updated at' })
  updatedAt: Date;
  @Field(() => Date, { nullable: true, description: 'Deleted at' })
  deletedAt: Date;
}
