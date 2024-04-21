import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class HumanMessage {
  @Field(() => String, {
    nullable: true,
    description: 'Message of Conversation Chatbot',
  })
  message: string;
 
}
