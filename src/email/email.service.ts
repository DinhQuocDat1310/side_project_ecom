import { UserService } from './../user/user.service';
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import Brevo = require('@getbrevo/brevo');
import { OTP_TTL_5_MINS, TIMES_VERIFY } from 'src/constants/email';
import { UserSignIn } from 'src/auth/dto/auth';
import { SendOTPEmail } from './entities/email.entity';

@Injectable()
export class EmailService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  configFormatEmail = async (
    reqUser: UserSignIn,
    apiInstance: any,
  ): Promise<any> => {
    const { email, username } = reqUser;

    try {
      const getExistingOTP = await this.cacheManager.get(email);
      if (getExistingOTP)
        return {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `OTP already sent. Please wait ${5} minute(s) to get new OTP`,
        };
      const otp = this.generateRandomSixDigitNumber();
      await this.cachingOTPCode(email, otp.toString());
      await apiInstance.sendTransacEmail({
        sender: {
          email: this.configService.get('BREVO_EMAIL_ADMIN'),
          name: this.configService.get('BREVO_NAME_ADMIN'),
        },
        subject: 'Ecom Service',
        htmlContent:
          '<!DOCTYPE html><html><body><h1>Shopee</h1><p>Email</p></body></html>',
        params: {
          greeting: 'Greeting',
          headline: 'Headline',
        },
        messageVersions: [
          {
            to: [
              {
                email,
                name: username,
              },
            ],
            //Base format Email
            htmlContent: `
            <!DOCTYPE html>
            <html>
              <body>
                <h1>Welcome to become we're partners!</h1>
                <p>Your code: ${otp}</p>
              </body>
            </html>`,
            subject: 'Welcome to Ecom',
          },
        ],
      });
      return {
        statusCode: HttpStatus.OK,
        message:
          'Send verify email successfully. Please check your email or spam folder',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  configConnectionBrevo = async (): Promise<any> => {
    const defaultBrevoClient = Brevo.ApiClient.instance;
    const apiKey = defaultBrevoClient.authentications['api-key'];
    apiKey.apiKey = this.configService.get('BREVO_API_KEY');
    return new Brevo.TransactionalEmailsApi();
  };

  generateOTP = async (user: UserSignIn): Promise<SendOTPEmail> => {
    const apiInstance = await this.configConnectionBrevo();
    return await this.configFormatEmail(user, apiInstance);
  };

  generateRandomSixDigitNumber(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  cachingOTPCode = async (key: string, value: string): Promise<any> => {
    return await this.cacheManager.set(
      key,
      {
        otp: value,
        times: TIMES_VERIFY,
      },
      OTP_TTL_5_MINS,
    );
  };

  verifyOTP = async (reqUser: UserSignIn, otp: string) => {
    const email = reqUser.email;
    const getOTP: { otp: string; times: number } = await this.cacheManager.get(
      email,
    );

    if (!getOTP || getOTP.otp !== otp) {
      if (getOTP) {
        getOTP.times--;
        if (getOTP.times > 0) {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: `Your OTP code is wrong. Remains ${getOTP.times} time(s)`,
          };
        }
      }
      await this.cacheManager.del(email);
      throw new BadRequestException('Your OTP code is invalid');
    }

    await this.cacheManager.del(email);
    const result = await this.userService.verify_email_otp(email);
    if (result) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Verify email successfully',
      };
    }
  };
}
