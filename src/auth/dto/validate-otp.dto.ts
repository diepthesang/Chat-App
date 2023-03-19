import { IsNotEmpty, Length } from 'class-validator';

export class ValidateOTP {
  @IsNotEmpty()
  @Length(6, 6)
  OTP: string;
}
