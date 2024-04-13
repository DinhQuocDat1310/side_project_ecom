import { Field, ObjectType } from '@nestjs/graphql';
import { Gender, Role, StatusUser } from '@prisma/client';

@ObjectType()
export class AuthToken {
  @Field(() => String, { description: 'Access Token' })
  accessToken: string;
  @Field(() => String, { description: 'Refresh Token' })
  refreshToken: string;
}
