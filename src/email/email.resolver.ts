import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { EmailService } from './email.service';
import { SendOTPEmail } from './entities/email.entity';
import { VerifyOTPInput } from './dto/create-otp.input';
import { UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Status } from 'src/guard/decorators';
import { StatusUser } from '@prisma/client';
import { StatusGuard } from 'src/guard/userStatus.guard';

@Resolver()
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Query(() => [SendOTPEmail], { name: 'emailMessageResponse' })
  @UseGuards(AccessJwtAuthGuard, StatusGuard)
  @Status(StatusUser.INIT)
  async sendOTPEmail(@Context() context: any) {
    const message = await this.emailService.generateOTP(context.req.user);
    return [message];
  }

  @Mutation(() => SendOTPEmail)
  @UseGuards(AccessJwtAuthGuard, StatusGuard)
  @Status(StatusUser.INIT)
  verifyOtp(
    @Args('otpInput') otpInput: VerifyOTPInput,
    @Context() context: any,
  ) {
    return this.emailService.verifyOTP(context.req.user, otpInput.otp);
  }
}
