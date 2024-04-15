import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VerifyOTPInput {
  @Field(() => String, { description: 'OTP Input' })
  otp: string;
}
