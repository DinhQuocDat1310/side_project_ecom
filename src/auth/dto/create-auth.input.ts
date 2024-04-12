import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';

@InputType()
export class CreateLoginAuthInput {
  @Field(() => String, { description: 'Username' })
  @IsString()
  username: string;
  @Field(() => String, { description: 'Password' })
  @IsString()
  password: string;
}
