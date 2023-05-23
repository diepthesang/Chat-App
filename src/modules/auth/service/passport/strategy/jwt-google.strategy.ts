import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { JwtPayload } from '../../../interface/jwt-payload';
import { GoogleOauth2Service } from '../../google-oauth2.service';

export class JwtGoogleStrategy extends PassportStrategy(
  Strategy,
  'jwt_google',
) {
  constructor() {
    super();
  }

  async validate(request: Request): Promise<JwtPayload | any> {
    try {
      const google_access_token =
        request.headers['authorization'].split(' ')[1];

      //verify google access token
      const tokenInfo =
        await GoogleOauth2Service.googleAuthOauth2().getTokenInfo(
          google_access_token,
        );

      return {
        userId: tokenInfo.sub,
        email: tokenInfo.email,
      } as JwtPayload;
    } catch (err) {
      return err.GaxiosError;
    }
  }
}
