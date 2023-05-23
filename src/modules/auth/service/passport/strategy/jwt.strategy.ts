import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../../../interface/jwt-payload";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { EXP_ACCESS_TOKEN, EXP_REFRESH_TOKEN } from "../../../../../utils/common/constant/auth.constants";
import { UserService } from "../../../../user/service/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET_KEY")
    });
  }

  async validate(jwtPayload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findOneBy({
      id: jwtPayload.userId
    });

    if (!user) throw new UnauthorizedException();

    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email
    } as JwtPayload;
  }

  generateAccessToken(jwtPayload: JwtPayload): string {
    try {
      return this.jwtService.sign(jwtPayload, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET_KEY"),
        expiresIn: EXP_ACCESS_TOKEN
      });
    } catch (error) {
      console.log({ error_generateAccessToken: error });
      throw error;
    }
  }

  generateRefreshToken(jwtPayload: JwtPayload) {
    try {
      return this.jwtService.sign(jwtPayload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET_KEY"),
        expiresIn: EXP_REFRESH_TOKEN
      });
    } catch (error) {
      console.log({ error_generateRefreshToken: error });
      throw error;
    }
  }

  verifyRefreshToken(refreshToken: string): JwtPayload | any {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET_KEY")
      });
    } catch (error) {
      console.log({ error_verifyRefreshToken: error });
      throw error;
    }
  }

  verifyAccessToken(accessToken: string): JwtPayload | any {
    try {
      return this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET_KEY")
      });
    } catch (error) {
      console.log({ error_verifyAccessToken: error.message });
      throw error;
    }
  }

  verifyBearerAccessToken(bearerAccessToken: string): JwtPayload | any {
    try {
      const _accessToken = bearerAccessToken.split(" ")[1];
      return this.verifyAccessToken(_accessToken);
    } catch (error) {
      console.error({ error_verifyBearerAccessToken: error.message });
      throw error;
    }
  }

  verifyBearerRefreshToken(bearerRefreshToken: string): JwtPayload {
    try {
      const _refreshToken = bearerRefreshToken.split(" ")[1];
      return this.verifyRefreshToken(_refreshToken);
    } catch (error) {
      console.log({ error_verifyBearerRefreshToken: error.message });
      throw error;
    }
  }
}
