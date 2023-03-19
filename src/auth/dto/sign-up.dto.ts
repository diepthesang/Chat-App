import { IsEmail, Length } from 'class-validator';
import { Match } from '../../custom/decorator/match.decorator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @Length(6, 20)
  textPassword: string;

  @Length(6, 20)
  @Match('textPassword', {
    message: 'confirmPassword is not match to password',
  })
  confirmTextPassword: string;

  // @IsString()
  // @MaxLength(30)
  // firstName: string;
  //
  // @IsString()
  // @MaxLength(30)
  // lastName: string;
  //
  // // @IsString()
  // // @NotContains(' ', { message: 'userName should not contain space' })
  // // @MaxLength(30)
  // // userName: string
  //
  // @IsNotEmpty()
  // @IsDateString()
  // dateOfBirth: Date;
}
