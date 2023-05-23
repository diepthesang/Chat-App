import { AuthService } from "../service/auth.service";
import { Body, Controller, Get, Post, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SignUpDto } from "../dto/sign-up.dto";
import { LocalAuthGuard } from "../service/passport/guards/local-auth.guard";
import { JwtAuthGuard } from "../service/passport/guards/jwt-auth.guard";
import { ValidateOtpDto } from "../dto/validate-otp.dto";
import { GoogleOAuthGuard } from "../service/passport/guards/google-oauth.guard";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "../../user/service/user.service";
import { BearerRefreshTokenDto } from "../dto/bearer-refresh-token.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
  }

  @Get("/test")
  async test() {
    return await this.userService.findAll();
  }

  @Post("/sign_up")
  @UsePipes(new ValidationPipe())
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post("/sign_in")
  @UsePipes(new ValidationPipe())
  @UseGuards(LocalAuthGuard)
  async signIn(@Request() req) {
    console.log("---SignIn----");
    return await this.authService.localSignIn(req.user);
  }

  @Get("/sign_out")
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return await this.authService.signOut(req.user);
  }

  @Get("/isTokenExpired")
  @UseGuards(JwtAuthGuard)
  async isTokenExpired(@Request() req) {
    console.log("____req___", req);
    return "request**";
  }

  @Get("/profile")
  @UseGuards(AuthGuard(["jwt", "jwt_google"]))
  async getProfile(@Request() req) {
    return await req.user;
  }

  @Post("/retrieve_access_token")
  @UsePipes(new ValidationPipe())
  async retrieveAccessTokenByRefreshToken(
    @Body() bearerRefreshToken: BearerRefreshTokenDto
  ) {
    return await this.authService.retrieveAccessTokenByRefreshToken(bearerRefreshToken.bearerRefreshToken);
  }

  @Get("/role")
  @UseGuards(JwtAuthGuard)
  async getRole(@Request() req) {
    return await this.authService.getRole(req.user.userId);
  }

  @Get("/send_mail")
  async sentMail() {
    // return await this.authService.sendMail();
  }

  @Post("/send_otp")
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async validateOTP(@Body() validateOTP: ValidateOtpDto, @Request() req) {
    return await this.authService.validateOTP(req.user, validateOTP.OTP);
  }

  @Get("/google")
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {
    console.log({ user: req.user });
    return req.user;
  }

  @Get("/google/callback")
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req.user);
  }
}
