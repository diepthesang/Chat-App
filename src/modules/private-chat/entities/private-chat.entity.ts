import { BaseEntity } from "../../../utils/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entity/user.entity";

@Entity("private_chats")
export class PrivateChatEntity extends BaseEntity {
  @Column({ name: "text" })
  text: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "sender_id" })
  sender: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "receiver_id" })
  receiver: UserEntity;
}
