import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserInput, FormatDataUser } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import {
  GOOGLE_PROVIDER,
  MESSAGE_EXISTED_EMAIL,
  MESSAGE_EXISTED_PHONE,
} from 'src/constants/user';
import { Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/service';
import * as moment from 'moment';
import { hash, compare } from 'bcrypt';
import { LoginUserDTO } from './dto/user';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create = async (createUserInput: CreateUserInput): Promise<User> => {
    const {
      email,
      password,
      phoneNumber,
      dateOfBirth,
      provider,
      role,
    }: CreateUserInput = createUserInput;
    await this.checkEmailUser(email, MESSAGE_EXISTED_EMAIL);
    await this.checkPhoneNumberUser(phoneNumber, MESSAGE_EXISTED_PHONE);
    const data: FormatDataUser = {
      ...createUserInput,
      dateOfBirth: dateOfBirth
        ? moment(dateOfBirth, 'DD/MM/YYYY').toDate()
        : null,
    };
    data[role.toLowerCase()] = {
      create:
        role === Role.SALESMAN
          ? {
              // Add more specific fields relate to Salesman
            }
          : {
              // Add more specific fields relate to Purchaser
            },
    };
    provider === GOOGLE_PROVIDER
      ? (data['password'] = null)
      : (data['password'] = await hash(password, 10));
    try {
      const user: User = await this.prismaService.user.create({
        data,
      });
      if (user['password']) delete user['password'];
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  checkEmailUser = async (email: string, message: string): Promise<void> => {
    if (email) {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (user) throw new BadRequestException(message);
    }
  };

  checkPhoneNumberUser = async (
    phoneNumber: string,
    message: string,
  ): Promise<void> => {
    if (phoneNumber) {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          phoneNumber,
        },
      });
      if (user) throw new BadRequestException(message);
    }
  };

  checkValidateUser = async (user: LoginUserDTO): Promise<User> => {
    const { username, password }: LoginUserDTO = user;
    try {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              email: username,
            },
            {
              phoneNumber: username,
            },
          ],
        },
      });
      if (
        user &&
        password &&
        user.password &&
        (await compare(password, user.password))
      ) {
        delete user['password'];
        return user;
      }
      if (user && !password && user.provider === GOOGLE_PROVIDER) return user;
      
      return null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  findUserByEmailOrPhoneNumber = async (username: string): Promise<User> => {
    try {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              email: username,
            },
            {
              phoneNumber: username,
            },
          ],
        },
      });
      if (user) {
        delete user['password'];
        return user;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  findAll = async (): Promise<User[]> => {
    return await this.prismaService.user.findMany({});
  };

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
