import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/service/passport/guards/jwt-auth.guard';
import { UpdateUserNameDto } from '../../auth/dto/updateUserName.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    const user = await this.userService.findOneBy({ id });
    const userDto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
    if (!userDto)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    throw new HttpException(
      { statusCode: HttpStatus.OK, data: userDto },
      HttpStatus.OK,
    );
  }

  @Get('update/1')
  async updateUser() {
    // return await this.userService.updateOneById('0da5c72b-0d34-4d8a-8ae0-2c22e8b81c9b2', { refreshToken: 'hehehe1' });
    return await this.userService.softDeleteOneBy({
      id: '0da5c72b-0d34-4d8a-8ae0-2c22e8b81c9b',
    });
  }

  @Get('user/delete')
  async deleteUser() {
    return this.userService.deleteUserByDate();
    // throw new HttpException('hehehe', HttpStatus.NOT_FOUND);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateUserName(
    @Body() updateUserNameDto: UpdateUserNameDto,
    @Request() req: any,
  ) {
    return await this.userService.updateOneBy(
      { id: req.user.id },
      {
        userName: updateUserNameDto.userName,
      },
    );
  }
}
