import { IsEmail, Length } from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  email: string;
  @Length(6, 20)
  password: string;
}
