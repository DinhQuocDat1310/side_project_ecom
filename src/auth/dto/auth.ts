import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Gender, Role, StatusUser } from '@prisma/client';

export class PayloadDTO {
  username: string;
  userId: string;
}
@InputType()
export class GitHubCode {
  @Field()
  codeAuth: string;
}

export class RequestUser {
  user: UserSignIn;
}

export class UserSignIn {
  id: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  status: StatusUser;
  role: Role;
  gender: Gender;
  dateOfBirth: string;
  avatar: string;
  provider?: string;
}

export class UserSignInWithRfToken {
  id: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  status: StatusUser;
  role: Role;
  gender: Gender;
  dateOfBirth: string;
  avatar: string;
  provider?: string;
  refreshToken: string;
}
