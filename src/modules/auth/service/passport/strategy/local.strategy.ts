import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { JwtPayload } from '../../../interface/jwt-payload';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'textPassword' });
  }

  async validate(
    email: string,
    textPassword: string,
  ): Promise<JwtPayload | any> {
    console.log('local strategy:::', { email, textPassword });
    return await this.authService.validateUser(email, textPassword);
  }
}
