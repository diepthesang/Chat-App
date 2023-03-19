// import { MailConsumer } from '../consumers/mail.consumer';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { SALTROUNDS } from 'src/constant/auth.constants';
import { JwtPayload } from '../interface/jwt-payload';
import {
  statusEnum,
  typeLoginEnum,
  UserEntity,
} from 'src/users/entity/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/strategy/jwt.strategy';
import { GoogleOauth2Service } from './google-oauth2.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
    @InjectQueue('send_email') private sendEmailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  //validate user before login
  async validateUser(email: string, textPassword: string) {
    const user = await this.userService.findOneBy({ email });

    if (!user)
      throw new HttpException(
        { message: ['Email is not exist'] },
        HttpStatus.NOT_FOUND,
      );

    const { hashPassword } = await this.userService.findOneBy({ email });

    const compareResult = await bcrypt.compare(textPassword, hashPassword);

    if (!compareResult)
      throw new NotAcceptableException({ message: ['Password is incorrect'] });

    return { userId: user.id, email: user.email };
  }

  // LOGIN
  async localSignIn(jwtPayload: JwtPayload) {
    const { status } = await this.userService.findOneBy({
      id: jwtPayload.userId,
    });

    if (status !== statusEnum.ACTIVE) throw new UnauthorizedException();

    const access_token = this.jwtStrategy.generateAccessToken(jwtPayload);

    const refresh_token = this.jwtStrategy.generateRefreshToken(jwtPayload);

    if (!access_token || !refresh_token) throw new UnauthorizedException();

    const isUpdate = await this.userService.updateOneBy(
      { id: jwtPayload.userId },
      {
        refreshToken: refresh_token,
      },
    );

    const user = await this.userService.findOneBy({ id: jwtPayload.userId });

    if (!isUpdate.affected || !user) throw new UnauthorizedException();

    return {
      statusCode: HttpStatus.OK,
      message: {
        typeLogin: typeLoginEnum.LOCAL,
        role: user.role,
        access_token,
        refresh_token,
      },
    };
  }

  async googleLogin(user: any): Promise<any> {
    if (!user) return 'No user from google';

    const tokenInfo = await GoogleOauth2Service.googleAuthOauth2().getTokenInfo(
      user.accessToken,
    );

    const isExistUser = await this.userService.findOneBy({
      email: tokenInfo.email,
      typeLogin: typeLoginEnum.GOOGLE,
    });

    const access_token = this.jwtStrategy.generateAccessToken({
      userId: tokenInfo.sub,
      email: tokenInfo.email,
    });

    const refresh_token = this.jwtStrategy.generateRefreshToken({
      userId: tokenInfo.sub,
      email: tokenInfo.email,
    });

    if (!isExistUser) {
      await this.userService.createOne<UserEntity>({
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avtImgPath: user.picture,
        refreshToken: user.refreshToken,
        userName: user.email,
        typeLogin: typeLoginEnum.GOOGLE,
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: {
        access_token,
        refresh_token,
        typeLogin: typeLoginEnum.GOOGLE,
      },
    };
  }

  //register new acccount
  async signUp(signUpDto: SignUpDto) {
    const { email, textPassword } = signUpDto;

    const user = await this.userService.findOneBy({ email });

    if (user) throw new BadRequestException(['Email is existing']);
    // generate hash password
    const HASH_PASSWORD = await this.generateHashPassword(
      textPassword,
      SALTROUNDS,
    );

    const OTP = this.generateOtp();

    const isCreated = await this.userService.createOne<any>({
      ...signUpDto,
      ...{
        hashPassword: HASH_PASSWORD,
        validateOTP: OTP,
        status: statusEnum.PENDING,
      },
    });

    const _user = await this.userService.findOneBy({
      id: isCreated.id,
    });

    const jwtPayload: JwtPayload = { userId: _user.id, email: _user.email };

    const access_token = this.jwtStrategy.generateAccessToken(jwtPayload);

    await this.sendEmail(OTP, email);

    await this.deleteUserQueue(OTP, email);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Bạn có 3 lần để xác thực OTP',
      // userId: isCreated['id'],
      access_token,
      role: isCreated['role'],
    };
  }

  //generate hash password
  async generateHashPassword(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async retrieveAccessTokenByRefreshToken(refreshTokenBearer: string) {
    if (refreshTokenBearer === `Bearer ${null}`) {
      throw new UnauthorizedException();
    }

    const _refreshToken = refreshTokenBearer.split(' ')[1];

    console.log('re___token___::', _refreshToken.trim());

    const jwtPayload = this.jwtStrategy.verifyRefreshToken(_refreshToken);

    if (!jwtPayload.userId) throw new UnauthorizedException();

    const user = await this.userService.findOneBy({ id: jwtPayload.userId });

    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const access_token = this.jwtStrategy.generateAccessToken({
      userId: jwtPayload.userId,
      email: jwtPayload.email,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: ['thanh cong'],
      data: { typeLogin: user.typeLogin, access_token },
    };
  }

  async signOut(jwtPayload: JwtPayload): Promise<any> {
    await this.userService.updateOneBy(
      { id: jwtPayload.userId },
      { refreshToken: null },
    );

    return { statusCode: HttpStatus.OK, message: 'Logout is successfully' };
  }

  async sendEmail(OTP: string, emailClient: string) {
    return await this.sendEmailQueue.add(
      'register_email',
      {
        to: emailClient,
        subject: 'OTP xác thực tài khoản',
        template: './email/email.hbs',
        context: {
          name: OTP,
        },
      },
      { removeOnComplete: true, removeOnFail: true },
    );
  }

  async deleteUserQueue(OTP: string, email: string) {
    return await this.sendEmailQueue.add(
      'validate_otp',
      { OTP, email },
      { removeOnComplete: true, removeOnFail: true },
    );
  }

  async validateOTP(jwtPayload: JwtPayload, OTP: string | number) {
    const user = await this.userService.findOneBy({ id: jwtPayload.userId });

    if (OTP !== user.validateOTP) {
      await this.userService.updateOneBy(
        { id: user.id },
        { timesValidateOTP: user.timesValidateOTP - 1 },
      );

      const { timesValidateOTP } = await this.userService.findOneBy({
        id: user.id,
      });

      if (timesValidateOTP <= 0) {
        await this.userService.hardDeleteOneBy({ id: user.id });
        throw new HttpException(
          { message: [`Không thể xác thực mã OTP`] },
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      throw new HttpException(
        { message: [`Bạn còn ${timesValidateOTP} lần xác thực OTP`] },
        HttpStatus.NOT_ACCEPTABLE,
      );
    } else {
      await this.userService.updateOneBy(
        { id: user.id },
        { status: statusEnum.ACTIVE },
      );

      return { message: 'Đăng ký thành công', statusCode: HttpStatus.CREATED };
    }
  }

  generateOtp() {
    return authenticator.generate(
      this.configService.get<string>('OTP_SECRET_KEY'),
    );
  }

  async getRole(userId: string) {
    const user = await this.userService.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();
    return {
      statusCode: HttpStatus.OK,
      message: {
        userId: user.id,
        role: user.role,
      },
    };
  }

  // async updateUserNameByUserId(userId: string, userName: string): Promise<any> {
  //   const user = await this.userService.findOneBy({ id: userId });
  //   if (!user)
  //     throw new HttpException(
  //       'Không thể cập nhât userName',
  //       HttpStatus.FORBIDDEN,
  //     );
  //   return await this.userService.updateOneBy({ id: userId }, { userName });
  // }

  // google login

  // verifyRefreshToken(refreshToken: string): JwtPayload {
  //   return this.jwtService.verify(refreshToken, {
  //     secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
  //   });
  // }
  //   return this.jwtStrategy.
}
