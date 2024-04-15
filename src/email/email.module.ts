import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailResolver } from './email.resolver';
import { PrismaService } from 'src/prisma/service';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  providers: [
    EmailResolver,
    EmailService,
    PrismaService,
    UserService,
    ConfigService,
  ],
})
export class EmailModule {}
