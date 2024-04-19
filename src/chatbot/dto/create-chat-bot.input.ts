import { InputType, Int, Field } from '@nestjs/graphql';

// @InputType()
// export class PrivateConversationInput {
//   @Field(() => String, {
//     nullable: true,
//     description: 'Title of Conversation Private',
//   })
//   title: string;
//   @Field(() => String, { description: 'Participation user ID' })
//   participationUserId: string;
// }

// @InputType()
// export class GroupConversationInput {
//   @Field(() => String, {
//     nullable: true,
//     description: 'Title of Conversation Group',
//   })
//   title: string;
//   @Field(() => [String], { description: 'Participation user ID' })
//   participationUserId: string[];
// }

@InputType()
export class ChatbotConversationInput {
  @Field(() => String, {
    nullable: true,
    description: 'Title of Conversation Chatbot',
  })
  title: string;
  @Field(() => String, { description: 'Participation user ID' })
  participationUserId: string;
}