import { CreateLoginAuthInput } from './dto/create-auth.input';
import { Resolver, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GqlLocalAuthGuard } from './guards/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthToken } from './entities/auth.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthToken)
  @UseGuards(GqlLocalAuthGuard)
  async login(
    //Just for args input in Mutation
    @Args('loginAuthInput') loginAuthInput: CreateLoginAuthInput,
    @Context() context: any,
  ) {
    return await this.authService.login(context.user);
  }
}
