import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { BaseService } from "src/utils/base/base.service";
import { UserEntity } from "../entity/user.entity";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dto/user.dto";
import { FriendService } from "../../friend/service/friend.service";

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => FriendService))
    private readonly friendService: FriendService
  ) {
    super(userRepository);
  }

  async deleteUserByDate() {
    return await this.repository.find({
      where: {
        createdAt: LessThan(new Date("2023-02-25 14:46:17.215770"))
      }
    });
  }

  async findUserByEmail(userId: string, email: string) {
    // kiem tra xem userId co trong he thong khong
    const user = await this.findOneBy({ email: email });
    if (!user) throw new NotFoundException();

    // kiem tra thu 2 user co bi chan lan nhau khong
    const isBlocked = await this.friendService.checkUserIsBlocked({ firstUserId: userId, secondUserId: user.id });
    if (isBlocked) throw new NotFoundException("Unable to find user, because you are blocked");

    const userDto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
      excludePrefixes: ["userName", "dateOfBirth"]
    });
    if (!userDto) throw new NotFoundException();

    return { success: true, statusCode: HttpStatus.OK, message: userDto };
  };


  async getUserByUserId(userId: string) {
    // kiem tra su ton tai cua user
    const user = await this.findOneBy({ id: userId });
    if (!user) throw new NotFoundException("User not found");
    const userDto = plainToInstance(UserDto, user, { excludeExtraneousValues: true });
    if (!userDto) throw new NotFoundException();
    return { success: true, statusCode: HttpStatus.OK, message: userDto };
  }


}
