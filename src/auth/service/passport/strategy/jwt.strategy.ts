import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../interface/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  EXP_ACCESS_TOKEN,
  EXP_REFRESH_TOKEN,
} from '../../../../constant/auth.constants';
import { UsersService } from '../../../../users/service/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(jwtPayload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findOneBy({
      id: jwtPayload.userId,
    });
    if (!user) throw new UnauthorizedException();
    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
    } as JwtPayload;
  }

  generateAccessToken(jwtPayload: JwtPayload): string {
    return this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET_KEY'),
      expiresIn: EXP_ACCESS_TOKEN,
    });
  }

  generateRefreshToken(jwtPayload: JwtPayload) {
    return this.jwtService.sign(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      expiresIn: EXP_REFRESH_TOKEN,
    });
  }

  verifyRefreshToken(refreshToken: string): JwtPayload {
    return this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
    });
  }

  verifyAccessToken(accessToken: string): JwtPayload {
    return this.jwtService.verify(accessToken, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }
}
