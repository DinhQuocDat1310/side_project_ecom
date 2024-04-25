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
    const user: User = request.req.user; // Assuming `user` is of type `User`

    if(request.req.query.openAIKey){
      process.env['OPENAI_API_KEY'] = request.req.query.openAIKey;

    }
    // console.log(process.env['OPENAI_API_KEY'])
    if (user.isAccessChatbot === false || !user.isAccessChatbot) {
      throw new ForbiddenException(
        'Unauthorized access due to missing OpenAI key or chatbot access.',
      );
    }
    return true;
  }

}
