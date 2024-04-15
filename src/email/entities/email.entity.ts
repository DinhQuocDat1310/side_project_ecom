import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SendOTPEmail {
  @Field(() => String, { description: 'Response message send OTP email' })
  message: string;
  @Field(() => Int, { description: 'Response status code' })
  statusCode: number;
}
