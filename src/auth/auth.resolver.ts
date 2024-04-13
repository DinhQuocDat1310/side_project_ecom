import { CreateLoginAuthInput } from './dto/create-auth.input';
import { Resolver, Mutation, Args, Int, Context ,Query} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GitHubCode } from './dto/auth';
import { GitHubAuth } from './entities/auth.entity';
import { GqlLocalAuthGuard } from './guards/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthToken } from './entities/auth.entity';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { Status } from 'src/guard/decorators';
import { StatusUser } from '@prisma/client';

@Resolver(() => GitHubAuth)
export class AuthGitHubResolver {
  constructor(private readonly authService: AuthService) {}
  
  


  @Query(() => GitHubAuth)
  githubLogin(@Args('gitHubCode') gitHubCode: GitHubCode) {
    return this.authService.githubLogin(gitHubCode);
  }
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthToken)
  @UseGuards(GqlLocalAuthGuard, StatusGuard)
  @Status(StatusUser.INIT, StatusUser.VERIFIED)
  async login(
    //Just for args input in Mutation
    @Args('loginAuthInput') loginAuthInput: CreateLoginAuthInput,
    @Context() context: any,
  ) {
    return await this.authService.login(context.user);
  }
}
