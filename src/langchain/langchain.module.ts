import { Module } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { LangchainResolver } from './langchain.resolver';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [LangchainResolver, LangchainService, ConfigService],
})
export class LangchainModule {}
