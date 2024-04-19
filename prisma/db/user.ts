import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

export const users = async (): Promise<any[]> => {
  const password: string = await hash('123456aA!', 10);

  const admin: Prisma.UserCreateInput = {
    email: 'admin@gmail.com',
    gender: 'MALE',
    password,
    role: 'ADMIN',
    status: 'VERIFIED',
    username: 'Administrator',
  };

  const bot: Prisma.UserCreateInput = {
    email: 'bot@gmail.com',
    gender: 'OTHER',
    password,
    role: 'MANAGER',
    status: 'VERIFIED',
    username: 'Bot',
  };

  return [admin, bot];
};
