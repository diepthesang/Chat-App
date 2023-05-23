import { Contains, IsNotEmpty, IsString, Length } from 'class-validator';

export class BearerRefreshTokenDto {
  @IsString({ groups: ['Bearer'] })
  @IsNotEmpty()
  @Length(6)
  @Contains('Bearer ')
  bearerRefreshToken: string;
}
