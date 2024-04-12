import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}


@ObjectType()
export class GitHubAuth {

  @Field(() => String, { description: 'Username' })
  codeAuth?: string;

  
}
