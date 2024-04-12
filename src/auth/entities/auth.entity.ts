import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class Auth {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}


@ObjectType()
export class GitHubAuth {

  @Field(() => String, { description: 'Username' })
  codeAuth?: string;
  
  @Field(() => User)
  user: User;
}

