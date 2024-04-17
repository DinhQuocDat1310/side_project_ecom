import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class PrivateConversationInput {
  @Field(() => String, { nullable: true, description: 'Title of Conversation' })
  title: string;
  @Field(() => String, { description: 'Participation user ID' })
  participationUserId: string;
}
