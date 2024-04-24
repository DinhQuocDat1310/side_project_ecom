import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MessageStatus, TypeConversation } from '@prisma/client';

@ObjectType()
export class Conversation {
  @Field(() => String, { description: 'Private Conversation ID' })
  id: string;
  @Field(() => String, { description: 'Title' })
  title: string;
  @Field(() => String, { description: 'Type Conversation' })
  type: TypeConversation;
  @Field(() => Boolean, { description: 'Conversation of Bot' })
  isBot: Boolean;
  @Field(() => String, { description: 'Creator ID' })
  creatorId: string;
  @Field(() => Date, { description: 'Created at' })
  createdAt: String;
  @Field(() => Date, { description: 'Updated at' })
  updatedAt: String;
}

@ObjectType()
export class ChatMessage {
  @Field(() => String, { description: 'Response message chat' })
  message: string;
  @Field(() => Int, { description: 'Response status code' })
  statusCode: number;
}

@ObjectType()
export class MessageData {
  @Field(() => String, { description: 'Message ID' })
  id: string;
  @Field(() => String, { description: 'Message text' })
  message: string;
  @Field(() => String, { nullable: true, description: 'Message chatbot' })
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
