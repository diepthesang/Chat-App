import { Injectable } from "@nestjs/common";
import { BaseService } from "../../../utils/base/base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { PrivateChatEntity } from "../entities/private-chat.entity";
import { Repository } from "typeorm";

@Injectable()
export class PrivateChatService extends BaseService<PrivateChatEntity> {
  constructor(
    @InjectRepository(PrivateChatEntity)
    private readonly privateChatRepository: Repository<PrivateChatEntity>
  ) {
    super(privateChatRepository);
  }

  async getMessages(senderId, receiverId) {
    try {
      return await this.privateChatRepository
        .createQueryBuilder("private-message")
        // .limit(20)
        .innerJoinAndSelect("private-message.sender", "sender")
        .innerJoinAndSelect("private-message.receiver", "receiver")
        .where("sender.id = :id", { id: senderId })
        .orWhere("sender.id = :id", { id: senderId })
        .andWhere("receiver.id = :id", { id: receiverId })
        .orWhere("receiver.id = :id", { id: receiverId })
        .select([
          "private-message.id",
          "private-message.text",
          "private-message.createdAt",
          "sender.id",
          "sender.firstName",
          "sender.lastName",
          "sender.avtImgPath",
          "receiver.id"
          // 'receiver.firstName',
          // 'receiver.lastName',
          // 'receiver.avtImgPath',
        ])
        .orderBy("private-message.createdAt", "DESC")
        .getOne();
    } catch (error) {
      console.log("_______Err___getMessage________", error);
      return error;
    }
  }
}
