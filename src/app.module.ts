import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/service';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { SalesmanModule } from './salesman/salesman.module';
import { EmailModule } from './email/email.module';
import { SocketModule } from './socket/socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from './chat/chat.module';
import { LangchainModule } from './langchain/langchain.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    CacheModule.register({
      store: redisStore,
      host: 'localhost', //default host
      port: 6379, //default port
    }),
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    UserModule,
    SalesmanModule,
    EmailModule,
    SocketModule,
    EventEmitterModule.forRoot({}),
    ChatModule,
    LangchainModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
