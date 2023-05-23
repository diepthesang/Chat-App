import {
  Controller,
  Get,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/service/passport/guards/jwt-auth.guard';
import { ConversationService } from '../service/conversation.service';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllConversationByUserId(@Request() req) {
    const allConversation =
      await this.conversationService.getAllConversationByUserId(
        req.user.userId,
      );
    return {
      statusCode: HttpStatus.OK,
      message: allConversation,
    };
  }
}
