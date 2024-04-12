import { Field } from '@nestjs/graphql';
import { Gender, Role, StatusUser } from '@prisma/client';

export class PayloadDTO {
  username: string;
  userId: string;
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
  role: Role;
  gender: Gender;
  dateOfBirth: string;
  avatar: string;
  provider?: string;
}
