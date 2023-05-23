import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/service/passport/guards/jwt-auth.guard";
import { MessageService } from "../service/message.service";
import { ConversationDto } from "../dto/conversation.dto";

@Controller("message")
export class MessageController {
  constructor(
    private readonly messageService: MessageService
  ) {
  }

  @Post("/conversation")
  @UseGuards(JwtAuthGuard)
  async createGroupChat(
    @Request() req,
    @Body("memberId", ParseUUIDPipe) memberId: string
  ) {
    // await this.groupService.createGroupChat(memberId, req.user.userId);
    console.log("______userId____", memberId);
    return "";
  }

  @Get("/:conversationId/skip/:qtyMessages")
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async getConversation(@Param() conversation: ConversationDto, @Request() req) {
    return await this.messageService.getMessagesByConversationBeSkipped(
      req.user.userId,
      conversation.conversationId,
      conversation.qtyMessages
    );
  }
}
