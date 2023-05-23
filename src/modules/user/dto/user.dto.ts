import { Expose, Transform } from 'class-transformer';
import { BaseDto } from 'src/utils/base/base.dto';

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

  @Expose()
  avtImgPath: string;
}
