import { Controller, Get, Param, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { GroupService } from "../service/group.service";
import { JwtAuthGuard } from "../../auth/service/passport/guards/jwt-auth.guard";
import { MemberDto } from "../dto/member.dto";

@Controller("group")
export class GroupController {
  constructor(private readonly groupsService: GroupService) {
  }

  @Get("/member/:memberId")
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async getConversationForGroupTwoMembers(@Param() member: MemberDto, @Request() req) {
    const firstMemberId = member.memberId;
    const secondMemberId = req.user.userId;
    return await this.groupsService.getConversationForGroupTwoMembers(firstMemberId, secondMemberId);
  }
}
