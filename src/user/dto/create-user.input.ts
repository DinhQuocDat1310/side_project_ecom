import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { Gender, Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { GOOGLE_PROVIDER } from 'src/constants/user';

// Register the enum with TypeGraphQL so it knows about it
registerEnumType(Role, {
  name: 'Role',
  description: 'The basic roles of User',
});

registerEnumType(Gender, {
  name: 'Gender',
  description: 'The basic genders of User',
});

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'Username' })
  @IsString()
  username?: string;
  @Field(() => String, { description: 'Email' })
  @IsEmail()
  email?: string;
  @Field(() => String, { description: 'Password' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  password: string;
  @Field(() => String, { description: 'Phone number' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  phoneNumber: string;
  @Field(() => String, { description: 'Address' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  address: string;
  @Field(() => Role, { description: 'Role' })
  @IsEnum([Role.SALESMAN, Role.PURCHASER], {
    message: 'Role must be following format: [SALESMAN, PURCHASER]',
  })
  role?: Role;
  @Field(() => Gender, { description: 'Gender' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsEnum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    message: 'Gender must be following format: [MALE, FEMALE, OTHER]',
  })
  gender: Gender;
  @Field(() => String, { description: 'Date of birth' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  dateOfBirth: string;
  @Field(() => String, { description: 'Avatar' })
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  avatar: string;
  @Field(() => String, { description: 'Provider' })
  @IsString()
  provider: string;
}

export class FormatDataUser {
  password?: string;
  dateOfBirth?: Date;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role?: Role;
  gender: Gender;
  avatar?: string;
  provider?: string;
}
