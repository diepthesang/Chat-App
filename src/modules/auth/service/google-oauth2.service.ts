import { google } from 'googleapis';

export class GoogleOauth2Service {
  static googleAuthOauth2() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }
}
