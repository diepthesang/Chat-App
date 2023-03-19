import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/base/base.dto';

export class UserDto extends BaseDto {
  @Expose()
  userName: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ obj }) => obj.firstName + ' ' + obj.lastName)
  fullName: string;

  @Expose()
  dateOfBirth: Date;
}
