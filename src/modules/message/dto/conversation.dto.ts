import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class ConversationDto {
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @IsNumberString()
  qtyMessages?: number | string;
}
