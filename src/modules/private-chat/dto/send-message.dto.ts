import { IsNotEmpty, IsString, IsUUID, Length } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  text: string;

  @IsNotEmpty()
  @IsUUID()
  receiverId?: string;

  // @IsNotEmpty()
  // @IsUUID()
  // senderId: string;

  @IsNotEmpty()
  @IsUUID()
  conversationId: string;
}
