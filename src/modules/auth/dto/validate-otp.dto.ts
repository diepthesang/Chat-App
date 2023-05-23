import { IsNotEmpty, Length } from 'class-validator';

export class ValidateOtpDto {
  @IsNotEmpty()
  @Length(6, 6)
  OTP: string;
}
