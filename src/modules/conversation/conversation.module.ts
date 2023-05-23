import { Module } from "@nestjs/common";
import { ConversationController } from "./controller/conversation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConversationEntity } from "./entity/conversation.entity";
import { ConversationService } from "./service/conversation.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity])
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {
}
