import { IsString, Length } from 'class-validator';

export class UpdateUserNameDto {
  @IsString()
  @Length(6, 30)
  userName: string;
}
