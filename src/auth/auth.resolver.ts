import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { CreateAuthInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { GitHubCode } from './dto/auth';
import { GitHubAuth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';
@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  
}
@Resolver(() => GitHubAuth)
export class AuthGitHubResolver {
  constructor(private readonly authService: AuthService) {}
  
  
//   @Mutation(() => GitHubAuth)
//   githubLoginMutation(@Args('gitHubCode') gitHubCode: GitHubCode) {
//     const rs = this.authService.githubLogin(gitHubCode);
//     console.log("rs",rs)
//   return rs
// }

  @Query(() => GitHubAuth)
  githubLogin(@Args('gitHubCode') gitHubCode: GitHubCode) {
    return this.authService.githubLogin(gitHubCode);
  }

}
