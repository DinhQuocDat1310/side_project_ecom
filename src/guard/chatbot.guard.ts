import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class ChatbotGuard implements CanActivate {

  constructor(
    private readonly prismaService: PrismaService,
  
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getNext();

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext();
    request.body = ctx.getArgs().createMessageInput;

    if(request.req.query.openAIKey){
      process.env['OPENAI_API_KEY'] = request.req.query.openAIKey;
    }

    return true;
  }

}
