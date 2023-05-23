import { IsNotEmpty, IsUUID } from "class-validator";

export class FriendRequestDto {

  @IsNotEmpty()
  @IsUUID()
  to: string;


}