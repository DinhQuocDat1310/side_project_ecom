import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from 'src/prisma/service';

@Module({
  imports: [],
  providers: [UserResolver, UserService, PrismaService],
})
export class UserModule {}
