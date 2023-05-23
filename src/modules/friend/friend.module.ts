import { forwardRef, Module } from "@nestjs/common";
import { FriendController } from "./friend.controller";
import { FriendService } from "./service/friend.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendEntity } from "./entity/friend.entity";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/service/user.service";
import { UserEntity } from "../user/entity/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendEntity, UserEntity]),
    forwardRef(() => UserModule)
  ],
  controllers: [FriendController],
  providers: [UserService, FriendService],
  exports: [FriendService]
})
export class FriendModule {
}
