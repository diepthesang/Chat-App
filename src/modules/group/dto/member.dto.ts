import { IsNotEmpty, IsUUID } from 'class-validator';

export class MemberDto {
  @IsNotEmpty()
  @IsUUID()
  memberId: string;
}
