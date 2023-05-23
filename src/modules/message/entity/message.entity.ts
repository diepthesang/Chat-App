import { BaseEntity } from "../../../utils/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";
import "reflect-metadata";
import { ConversationEntity } from "../../conversation/entity/conversation.entity";

@Entity("messages")
export class MessageEntity extends BaseEntity {
  @Column({ name: "text" })
  text: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "sender_id" })
  sender: UserEntity;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({ name: "conversation_id" })
  conversation: ConversationEntity;
}
