import { Module } from "@nestjs/common";
import { GroupController } from "./controller/group.controller";
import { GroupService } from "./service/group.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupEntity } from "./entity/group.entity";
import { ConversationModule } from "../conversation/conversation.module";
import { ConversationService } from "../conversation/service/conversation.service";
import { ConversationEntity } from "../conversation/entity/conversation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, ConversationEntity]),
    ConversationModule,
    GroupModule
  ],
  controllers: [GroupController],
  providers: [GroupService, ConversationService],
  exports: [GroupService]
})
export class GroupModule {
}
