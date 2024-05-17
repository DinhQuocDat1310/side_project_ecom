import { CreateLoginAuthInput } from './dto/create-auth.input';
import { Resolver, Mutation, Args, Int, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GitHubCode } from './dto/auth';
import {
  AuthAccessToken,
  AuthMessage,
  GitHubAuth,
} from './entities/auth.entity';
import { GqlLocalAuthGuard } from './guards/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthToken } from './entities/auth.entity';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { Status } from 'src/guard/decorators';
import { StatusUser } from '@prisma/client';
import { AccessJwtAuthGuard } from './guards/jwt-access-auth.guard';
import { RefreshJwtAuthGuard } from './guards/jwt-refresh-auth.guard';

@Resolver(() => GitHubAuth)
export class AuthGitHubResolver {
  constructor(private readonly authService: AuthService) {}
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => AuthToken)
  githubLogin(@Args('gitHubCode') gitHubCode: GitHubCode) {
    return this.authService.githubLogin(gitHubCode);
  }
  @Query(() => AuthToken)
  googleLogin(@Args('googleIDToken') googleIDToken: string) {
    return this.authService.googleLogin(googleIDToken);
  }
  // @Mutation(() => AuthToken)
  // // @UseGuards(GqlLocalAuthGuard, StatusGuard)
  // @Status(StatusUser.INIT, StatusUser.VERIFIED)
  // async googleLogin(
  //   //Just for args input in Mutation
  //   @Args('googleIDToken') googleIDToken: string,
  //   // @Context() context: any,
  // ) {
  //   return await this.authService.googleLogin(googleIDToken);
  // }

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

  @Mutation(() => AuthMessage)
  @UseGuards(AccessJwtAuthGuard)
  @Status(StatusUser.INIT, StatusUser.VERIFIED)
  async logout(@Context() context: any) {
    return await this.authService.logout(context.req.user);
  }

  @Mutation(() => AuthAccessToken)
  @UseGuards(RefreshJwtAuthGuard)
  @Status(StatusUser.INIT, StatusUser.VERIFIED)
  async refreshToken(@Context() context: any) {
    return await this.authService.refreshToken(context.req.user);
  }
}
