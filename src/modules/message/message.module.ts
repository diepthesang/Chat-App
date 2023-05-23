import { Module } from "@nestjs/common";
import { MessageService } from "./service/message.service";
import { MessageController } from "./controller/message.controller";
import { ConversationService } from "../conversation/service/conversation.service";
import { GroupService } from "../group/service/group.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./entity/message.entity";
import { ConversationModule } from "../conversation/conversation.module";
import { GroupModule } from "../group/group.module";
import { ConversationEntity } from "../conversation/entity/conversation.entity";
import { GroupEntity } from "../group/entity/group.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationEntity, GroupEntity]),
    ConversationModule,
    GroupModule
  ],
  controllers: [MessageController],
  providers: [MessageService, ConversationService, GroupService],
  exports: [MessageService, ConversationService]
})
export class MessageModule {
}
