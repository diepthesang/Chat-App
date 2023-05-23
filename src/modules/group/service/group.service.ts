import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../../utils/base/base.service";
import { GroupEntity } from "../entity/group.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConversationService } from "../../conversation/service/conversation.service";
import { ConversationEntity } from "../../conversation/entity/conversation.entity";

@Injectable()
export class GroupService extends BaseService<GroupEntity> {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    private readonly conversationService: ConversationService
  ) {
    super(groupRepository);
  }

  async createGroup(memberId: string, userId: string) {
    try {
      const conversation: ConversationEntity =
        await this.conversationService.createConversation();

      console.log("___conversation___", conversation);

      await this.createOne<GroupEntity>({
        conversation: { id: conversation.id },
        member: { id: userId }
      });

      await this.createOne<GroupEntity>({
        conversation: { id: conversation.id },
        member: { id: memberId }
      });
    } catch (error) {
      console.log({ error_createGroup: error });
      // return error
      throw new InternalServerErrorException();
    }
  }

  async getConversationForGroupTwoMembers(firstMemberId: string, secondMemberId: string) {
    try {
      const strQuery = `SELECT 
                        count(gr.conversation_id) as count_gr_conversation_id,
                        gr.conversation_id
                        FROM chat_app_db.groups gr 
                        where gr.member_id in ('${firstMemberId}','${secondMemberId}')
                        group by gr.conversation_id
                        having count(gr.conversation_id) = 2`;

      const group = await this.groupRepository.query(strQuery);

      if (group.length <= 0 || group[0] === null) {
        await this.createGroup(firstMemberId, secondMemberId);
        return await this.groupRepository.query(strQuery);
      }

      // if (!group) throw new Error(null);
      return { statusCode: HttpStatus.OK, message: group };
    } catch (error) {
      console.log({ error_getConversationForGroupTwoMembers: error });
      if (error.message === null) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }

  async getMembersInConversation(conversationId) {
    try {
      return await this.groupRepository
        .createQueryBuilder("group")
        .innerJoinAndSelect("group.member", "member")
        .where("group.conversation = :conversation", {
          conversation: conversationId
        })
        .select(["group.id", "member.id"])
        .getMany();
      // return await this.groupRepository.findBy({
      //   conversation: { id: conversationId },
      // });
    } catch (error) {
      console.error({ err_getMemberInConversation: error });
      throw new InternalServerErrorException();
    }
  }

  async checkExistingMemberInGroup(memberId: string, conversationId: string) {
    // console.log({ memberId, conversationId });
    try {
      return await this.groupRepository
        .createQueryBuilder("group")
        .where("group.member = :member", { member: memberId })
        .andWhere("group.conversation = :conversation", {
          conversation: conversationId
        })
        .getOne();
    } catch (error) {
      console.log({ error_checkExistingMemberInGroup: error });
      throw new InternalServerErrorException();
    }
  }

}
