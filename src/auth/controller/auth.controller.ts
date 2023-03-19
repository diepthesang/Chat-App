import { AuthService } from '../service/auth.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SignUpDto } from '../dto/sign-up.dto';
import { LocalAuthGuard } from '../service/passport/guards/local-auth.guard';
import { JwtAuthGuard } from '../service/passport/guards/jwt-auth.guard';
import { ValidateOTP } from '../dto/validate-otp.dto';
import { GoogleOAuthGuard } from '../service/passport/guards/google-oauth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  @UsePipes(new ValidationPipe())
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  @UsePipes(new ValidationPipe())
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req) {
    return await this.authService.localSignIn(req.user);
  }

  @Get('/sign-out')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return await this.authService.signOut(req.user);
  }

  @Get('/profile')
  @UseGuards(AuthGuard(['jwt', 'jwt_google']))
  async getProfile(@Request() req) {
    return await req.user;
  }

  @Get('/retrieve-access-token')
  async verifyRefreshToken(@Headers() header: Headers) {
    // console.log('___header:::', header);
    return await this.authService.retrieveAccessTokenByRefreshToken(
      header['authorization'],
    );
  }

  @Get('/role')
  @UseGuards(JwtAuthGuard)
  async getRole(@Request() req) {
    console.log('___req:::', req.user);
    return await this.authService.getRole(req.user.userId);
  }

  @Get('/send-mail')
  async sentMail() {
    // return await this.authService.sendMail();
  }

  @Post('/send-otp')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async validateOTP(@Body() validateOTP: ValidateOTP, @Request() req) {
    return await this.authService.validateOTP(req.user, validateOTP.OTP);
  }

  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {
    console.log({ user: req.user });
    return req.user;
  }

  @Get('/google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req.user);
  }

  // @Get('/test/guard')
  // @UseGuards(AuthGuard(['jwt', 'google']))
  // // @UseGuards(JwtGoogleAuthGuard)
  // testAuthGuard(@Request() req: any) {
  //   console.log('da vao test/guard');
  //   return 'test/guard';
  // }

  // @Put('updateUsername')
  // @UseGuards(JwtAuthGuard)
  // async updateUserName(
  //   @Body('') updateUserNameDto: UpdateUserNameDto,
  //   @Request() req,
  // ) {
  //   await this.authService.updateUserNameByUserId(
  //     req.user.userId,
  //     updateUserNameDto.userName,
  //   );
  // }

  // @Get('/facebook-redirect')
  // @UseGuards(FacebookAuthGuard)
  // async facebookLoginRedirect(@Request() req): Promise<any> {
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: req.user,
  //   };
  // }
  //
  // @Get('/facebook')
  // @UseGuards(FacebookAuthGuard)
  // async facebookLogin(): Promise<any> {
  //   return HttpStatus.OK;
  // }
}
