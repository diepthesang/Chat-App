import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Request, UseGuards } from "@nestjs/common";
import { FriendService } from "./service/friend.service";
import { JwtAuthGuard } from "../auth/service/passport/guards/jwt-auth.guard";

@Controller("friend")
export class FriendController {

  constructor(private readonly friendService: FriendService) {
  }

  @Get("/relationship_status/:userId")
  @UseGuards(JwtAuthGuard)
  async getUsersRelationshipStatus(@Param("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return await this.friendService.getUsersRelationshipStatus({
      firstUserId: req.user.userId,
      secondUserId: userId
    });
  }

  @Post("/add_friend")
  @UseGuards(JwtAuthGuard)
  async addFriend(@Body("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return await this.friendService.addFriend({ firstUserId: req.user.userId, secondUserId: userId });
  }

  @Post("/cancel_friend_request")
  @UseGuards(JwtAuthGuard)
  async cancelFriendRequest(@Body("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return await this.friendService.cancelFriendRequest({ firstUserId: req.user.userId, secondUserId: userId });
  }

  @Post("/accept_friend_request")
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(@Body("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return await this.friendService.acceptFriendRequest({ firstUserId: req.user.userId, secondUserId: userId });
  }

  @Post("/block_user")
  @UseGuards(JwtAuthGuard)
  async blockUser(@Body("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return await this.friendService.blockUser({ firstUserId: req.user.userId, secondUserId: userId });
  }

  @Post("/unfriend")
  @UseGuards(JwtAuthGuard)
  async unfriend(@Body("userId", ParseUUIDPipe) userId: string, @Request() req: any) {
    return this.friendService.unfriend({ firstUserId: req.user.userId, secondUserId: userId });
  }

}
