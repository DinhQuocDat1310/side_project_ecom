import { ObjectType, Field, Int } from '@nestjs/graphql';
import { TypeConversation } from '@prisma/client';

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
