import { ValidateIf } from 'class-validator';
import { GOOGLE_PROVIDER } from 'src/constants/user';

export class LoginUserDTO {
  username: string;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  password?: string;
}
