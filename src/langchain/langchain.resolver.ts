import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { LangchainService } from './langchain.service';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { AIMessage } from './entities/langchain.entity';
import { HumanMessage } from './dto/langchain.input';

@Resolver()
@UseGuards(AccessJwtAuthGuard)
export class LangchainResolver {
  constructor(private readonly langchainService: LangchainService) {}

  @Mutation(() => AIMessage)
  async queryChatbot(
    @Args('humanMessage')
    humanMessage: HumanMessage,
  ) {
    return await this.langchainService.query(humanMessage);
  }

  @Mutation(() => String)
  async createContentForVectorStore(
    @Args('humanMessage')
    humanMessage: HumanMessage,
  ): Promise<string> {
    return await this.langchainService.create(humanMessage);
  }
}
