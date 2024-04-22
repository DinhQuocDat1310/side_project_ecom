import { Module } from '@nestjs/common';
import { LangchainService } from './langchain.service';
import { LangchainResolver } from './langchain.resolver';

@Module({
  providers: [LangchainResolver, LangchainService],
})
export class LangchainModule {}
