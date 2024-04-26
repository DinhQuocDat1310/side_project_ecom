import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { OpenAI, OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    const llmModel = new OpenAIEmbeddings()
    const llmChatModel = new OpenAI()

    user.llmModel = llmModel
    user.llmChatModel = llmChatModel

    if (!user) throw new UnauthorizedException();
    return user;
  }
}
