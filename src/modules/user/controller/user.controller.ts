import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { UserService } from "../service/user.service";
import { UserDto } from "../dto/user.dto";
import { JwtAuthGuard } from "../../auth/service/passport/guards/jwt-auth.guard";
import { UpdateUserNameDto } from "../../auth/dto/updateUserName.dto";
import { MessageService } from "../../message/service/message.service";
import { EmailDto } from "../dto/email.dto";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly messagesService: MessageService
  ) {
  }

  @Get("update/1")
  async updateUser() {
    // return await this.userService.updateOneById('0da5c72b-0d34-4d8a-8ae0-2c22e8b81c9b2', { refreshToken: 'hehehe1' });
    return await this.userService.softDeleteOneBy({
      id: "0da5c72b-0d34-4d8a-8ae0-2c22e8b81c9b"
    });
  }

  @Get("user/delete")
  async deleteUser() {
    return await this.userService.deleteUserByDate();
    // throw new HttpException('hehehe', HttpStatus.NOT_FOUND);
  }

  @Put("update")
  @UseGuards(JwtAuthGuard)
  async updateUserName(@Body() updateUserNameDto: UpdateUserNameDto, @Request() req: any) {
    return await this.userService.updateOneBy(
      { id: req.user.id },
      {
        userName: updateUserNameDto.userName
      }
    );
  }

  @Post("/msg-user")
  async saveMsgUser(@Body() body: any) {
    console.log("___body_msg_user::", body);
    return await this.messagesService.createOne<any>({ ...body });
  }

  @Get("/email/:email")
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async findUserByEmail(@Param() param: EmailDto, @Request() req) {
    return await this.userService.findUserByEmail(req.user.userId, param.email);
  }

  @Get(":userId")
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param("userId", ParseUUIDPipe) userId: string): Promise<UserDto | any> {
    return await this.userService.getUserByUserId(userId);
  }
}
