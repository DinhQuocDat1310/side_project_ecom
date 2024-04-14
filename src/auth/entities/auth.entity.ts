import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class AuthToken {
  @Field(() => String, { description: 'Access Token' })
  accessToken: string;
  @Field(() => String, { description: 'Refresh Token' })
  refreshToken: string;
}


@ObjectType()
export class GitHubAuth {

  @Field(() => String, { description: 'Username' })
  codeAuth?: string;
  
  @Field(() => User)
  user: User;
}

