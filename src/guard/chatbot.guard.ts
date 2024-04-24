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
    const request = context.switchToHttp().getNext();
    const user: User = request.req.user; // Assuming `user` is of type `User`

    const ctx = GqlExecutionContext.create(context);
    const request2 = ctx.getContext();
    request2.body = ctx.getArgs().createMessageInput;

    if (user.isAccessChatbot === false) {
      throw new ForbiddenException(
        'Unauthorized access due to missing OpenAI key or chatbot access.',
      );
    }
    return true;
  }

}
