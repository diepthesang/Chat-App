import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { ConversationEntity } from "../../conversation/entity/conversation.entity";
import { UserEntity } from "../../user/entity/user.entity";
import { BaseEntity } from "../../../utils/base/base.entity";

@Entity("groups")
export class GroupEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "member_id" })
  member: UserEntity;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({ name: "conversation_id" })
  conversation: ConversationEntity;
}
