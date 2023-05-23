import { Module } from "@nestjs/common";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { UserModule } from "src/modules/user/user.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./service/passport/strategy/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { EXP_ACCESS_TOKEN } from "src/utils/common/constant/auth.constants";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { MailConsumer } from "./consumers/mail.consumer";
import { GoogleStrategy } from "./service/passport/strategy/google.strategy";
import { FacebookStrategy } from "./service/passport/strategy/facebook.strategy";
import { JwtStrategy } from "./service/passport/strategy/jwt.strategy";
import { JwtGoogleStrategy } from "./service/passport/strategy/jwt-google.strategy";

@Module({
  imports: [
    AuthModule,
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_ACCESS_SECRET_KEY"),
        signOptions: { expiresIn: EXP_ACCESS_TOKEN }
      })
    }),
    BullModule.registerQueue({
      name: "send_email"
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    MailConsumer,
    GoogleStrategy,
    FacebookStrategy,
    JwtStrategy,
    JwtGoogleStrategy
  ],
  exports: [AuthService, JwtStrategy]
})
export class AuthModule {
}
