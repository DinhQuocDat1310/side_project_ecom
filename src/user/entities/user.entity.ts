import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Gender, Role } from '@prisma/client';

@ObjectType()
export class User {
  @Field(() => String, { description: 'Username' })
  username?: string;
  @Field(() => String, { description: 'Email' })
  email?: string;
  @Field(() => String, { description: 'Password' })
  password: string;
  @Field(() => String, { description: 'Phone number' })
  phoneNumber: string;
  @Field(() => String, { description: 'Address' })
  address: string;
  @Field(() => Role, { description: 'Role' })
  role: Role;
  @Field(() => Gender, { description: 'Gender' })
  gender: Gender;
  @Field(() => String, { description: 'Date of birth' })
  dateOfBirth: string;
  @Field(() => String, { description: 'Avatar' })
  avatar: string;
  @Field(() => String, { description: 'Provider' })
  provider?: string;
}
