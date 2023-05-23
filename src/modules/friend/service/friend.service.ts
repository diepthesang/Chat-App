import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { BaseService } from "../../../utils/base/base.service";
import { FriendEntity, statusEnum } from "../entity/friend.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../../user/service/user.service";

@Injectable()
export class FriendService extends BaseService<FriendEntity> implements OnModuleInit {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {
    super(friendRepository);
  }

  async onModuleInit() {
    // await this.getFriendRelationshipStatus({
    //   _firstUserId: "5214b163-53a1-431d-88e0-cd1794fe707b",
    //   _secondUserId: "dcf6e48e-d80e-45b3-9634-e321a26d02ae"
    // });
  }

  async checkExistenceOfRelationsOfUsers(users: { firstUserId: string, secondUserId: string }) {
    try {
      return await this.friendRepository.findOne({
        where: [
          { firstUserId: users.firstUserId, secondUserId: users.secondUserId },
          { firstUserId: users.secondUserId, secondUserId: users.firstUserId }
        ]
      });
    } catch (error) {
      console.log({ error_checkExistenceOfFriendshipRelationship: error.message });
      throw new InternalServerErrorException();
    }
  }

  async getUsersRelationshipStatus(users: { firstUserId: string, secondUserId: string }) {
    //kiem tra xem users co ton tai trong he thong
    const _user = await this.userService.findOneBy({ id: users.secondUserId });
    if (!_user) throw new NotFoundException();

    const isDuplicate = await this.checkDuplicateUser({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    if (isDuplicate) throw  new NotFoundException();

    const friend = await this.friendRepository.findOne({
      where: [
        { firstUserId: users.firstUserId, secondUserId: users.secondUserId },
        { firstUserId: users.secondUserId, secondUserId: users.firstUserId }
      ]
    });
    if (!friend) throw new NotFoundException();
    return { success: true, statusCode: HttpStatus.OK, message: friend.status };
  }

  // send friend request to other user
  async addFriend(users: { firstUserId: string, secondUserId: string }) {
    // kiem tra trung lap user
    if (users.firstUserId === users.secondUserId) throw new NotAcceptableException("Unable to send friend requests to myself");
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    // neu 2 nguoi dung da co moi quan he roi, thi khong the gui loi moi ket ban duoc nua
    if (rs) throw new NotAcceptableException("Friend users failed");
    // gui loi moi ket ban
    const result = await this.createOne<FriendEntity>({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    if (!result) throw new NotAcceptableException("Friend users failed");
    return { success: true, statusCode: HttpStatus.CREATED, message: "Friend users successfully" };
  }

  async cancelFriendRequest(users: { firstUserId: string, secondUserId: string }) {
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    if (!rs || rs?.status !== statusEnum.PENDING) throw new NotAcceptableException("Unable to cancel friend users");
    const _rsDeleted = await this.hardDeleteOneBy({ id: rs.id });
    if (!_rsDeleted.affected) throw new NotAcceptableException("Unable to cancel friend users");
    return { success: true, statusCode: HttpStatus.CREATED, message: "Canceled friend users successfully" };
  }

  async acceptFriendRequest(users: { firstUserId: string, secondUserId: string }) {
    // kiem tra su ton tai cua moi quan he
    const rs = await this.checkExistenceOfRelationsOfUsers(users);
    if (!rs || rs?.status !== statusEnum.PENDING) throw new Error("Unable to accept friend request");

    await this.friendRepository.update({ id: rs.id }, { status: statusEnum.FRIEND });

    return { success: true, statusCode: HttpStatus.ACCEPTED, message: "Accept friend request successfully" };
  }

  async unfriend(users: { firstUserId: string, secondUserId: string }) {
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    if (!rs || rs.status !== statusEnum.FRIEND) throw new NotAcceptableException("Unable to unfriend");

    const rsDeleted = await this.hardDeleteOneBy({ id: rs.id });
    if (!rsDeleted.affected) throw new NotAcceptableException("Unable to unfriend");

    return { success: true, statusCode: HttpStatus.ACCEPTED, message: "Unfriend successfully" };
  }


  // block user
  async blockUser(users: { firstUserId: string, secondUserId: string }) {
    if (users.firstUserId === users.secondUserId) throw new NotAcceptableException("Duplicate user");

    // kiem tra su ton tai cua moi quan he
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });

    if (!rs) {
      await this.createOne<FriendEntity>({
        firstUserId: users.firstUserId,
        secondUserId: users.secondUserId,
        status: statusEnum.BLOCK
      });
      return { success: true, statusCode: HttpStatus.ACCEPTED, message: "Block user successfully" };
    }

    //kiem tra xem user da bi block truoc chua
    if (rs.status === statusEnum.BLOCK && rs.firstUserId === users.secondUserId) throw new NotAcceptableException("You are blocked by other user");

    // user nao bi block se bi chuyen qa secondUserId
    const rsUpdate = await this.friendRepository.update({ id: rs.id }, {
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId,
      status: statusEnum.BLOCK
    });

    console.log({ rsUpdate });

    if (!rsUpdate.affected) throw new NotAcceptableException("Failure");

    return { success: true, statusCode: HttpStatus.ACCEPTED, message: "Block user successfully" };
  }

  // kiem tra xem user co bi block boi user khac hay khong
  async checkUserIsBlocked(users: { firstUserId: string, secondUserId: string }) {
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    return !!(rs && rs.status === statusEnum.BLOCK);
  };

  async checkAreFriends(users: { firstUserId: string, secondUserId: string }) {
    const rs = await this.checkExistenceOfRelationsOfUsers({
      firstUserId: users.firstUserId,
      secondUserId: users.secondUserId
    });
    return !!(rs && rs.status === statusEnum.FRIEND);
  }

  // kiem tra xem 2 user co trung lap khong
  async checkDuplicateUser(users: { firstUserId: string, secondUserId: string }) {
    return (users.firstUserId === users.secondUserId);
  }


}
