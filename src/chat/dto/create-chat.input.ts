import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { MessageStatus } from '@prisma/client';

// Register the enum with TypeGraphQL so it knows about it
registerEnumType(MessageStatus, {
  name: 'MessageStatus',
  description: 'The basic status of Message',
});
@InputType()
export class PrivateConversationInput {
  @Field(() => String, {
    nullable: true,
    description: 'Title of Conversation Private',
  })
  title: string;
  @Field(() => Boolean, {
    nullable: true,
    description: 'Is Bot',
  })
  isBot: Boolean;
  @Field(() => String, { description: 'Participation user ID' })
  participationUserId: string;
}

@InputType()
export class GroupConversationInput {
  @Field(() => String, {
    nullable: true,
    description: 'Title of Conversation Group',
  })
  title: string;
  @Field(() => [String], { description: 'Participation user ID' })
  participationUserId: string[];
}

@InputType()
export class CreateMessageInput {
  @Field(() => String, {
    description: 'Conversation ID',
  })
  conversationId: string;
  @Field(() => String, {
    description: 'Message text',
  })
  messageText: string;
}
