import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PayloadDTO {
  username: string;
  userId: string;
}
@InputType()
export class GitHubCode {
 
  @Field()
  codeAuth: string;
}

