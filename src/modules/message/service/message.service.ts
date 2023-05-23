import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../../utils/base/base.service";
import { MessageEntity } from "../entity/message.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GroupService } from "../../group/service/group.service";

@Injectable()
export class MessageService extends BaseService<MessageEntity> {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messagesRepository: Repository<MessageEntity>,
    private readonly groupService: GroupService
  ) {
    super(messagesRepository);
  }

  async getMessagesByConversationBeSkipped(
    memberId: string,
    conversationId: string,
    qtyMessages: string | number
  ) {
    try {
      const QTY_MESSAGE_ONE_PAGE = 20;

      const checkExistingMemberInGroup =
        await this.groupService.checkExistingMemberInGroup(
          memberId,
          conversationId
        );

      if (!checkExistingMemberInGroup) throw new NotFoundException();

      const messages = await this.messagesRepository
        .createQueryBuilder("message")
        .innerJoinAndSelect("message.sender", "sender")
        .where("message.conversation = :conversation", {
          conversation: conversationId
        })
        .select([
          "message.id",
          "message.text",
          "message.createdAt",
          "sender.id",
          "sender.firstName",
          "sender.lastName",
          "sender.avtImgPath"
        ])
        .orderBy("message.createdAt", "DESC")
        .take(QTY_MESSAGE_ONE_PAGE)
        .skip(Number(qtyMessages))
        .getMany();
      // console.log({ message_and_count: messages });
      if (!messages) throw new Error("null");
      return { statusCode: HttpStatus.OK, message: messages };
    } catch (error) {
      if (error.message === "null") throw new NotFoundException();
      console.log({ error_getMessagesByConversationBeSkipped: error });
      throw new InternalServerErrorException();
    }
  }

  async getLastMessageByConversationId(conversationId: string) {
    try {
      return await this.messagesRepository
        .createQueryBuilder("message")
        .innerJoinAndSelect("message.sender", "sender")
        .innerJoinAndSelect("message.conversation", "conversation")
        .where("message.conversation = :conversation", {
          conversation: conversationId
        })
        .select([
          "conversation.id",
          "message.id",
          "message.text",
          "message.createdAt",
          "sender.id",
          "sender.firstName",
          "sender.lastName",
          "sender.avtImgPath"
        ])
        .orderBy("message.createdAt", "DESC")
        .getOne();
    } catch (error) {
      console.log({ error_getLastMessageByConversationId: error.message });
      throw new InternalServerErrorException();
    }
  }

}
