import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { MessageModule } from "../message/message.module";
import { MessageService } from "../message/service/message.service";
import { MessageEntity } from "../message/entity/message.entity";
import { GroupModule } from "../group/group.module";
import { GroupService } from "../group/service/group.service";
import { GroupEntity } from "../group/entity/group.entity";
import { FriendModule } from "../friend/friend.module";
import { FriendService } from "../friend/service/friend.service";
import { FriendEntity } from "../friend/entity/friend.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, MessageEntity, GroupEntity, FriendEntity]),
    MessageModule,
    GroupModule,
    forwardRef(() => FriendModule)
  ],
  controllers: [UserController],
  providers: [UserService, MessageService, GroupService, FriendService],
  exports: [UserService]
})
export class UserModule {
}
