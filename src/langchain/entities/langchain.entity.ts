import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MessageStatus, TypeConversation } from '@prisma/client';

@ObjectType()
export class AIMessage {
  @Field(() => String, { description: 'Status' })
  status: string;
  @Field(() => String, { description: 'AI Message' })
  message: string;
}
