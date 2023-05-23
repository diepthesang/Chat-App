import { BaseEntity } from "../../../utils/base/base.entity";
import { Column, Entity } from "typeorm";

export const statusEnum = {
  PENDING: "pending",
  FRIEND: "friend",
  BLOCK: "block"
};

@Entity("friends")
export class FriendEntity extends BaseEntity {
  @Column({ name: "first_user_id", length: 100, nullable: false })
  firstUserId: string;
  @Column({ name: "second_user_id", length: 100, nullable: false })
  secondUserId: string;
  @Column({ type: "enum", name: "status", default: statusEnum.PENDING, enum: statusEnum })
  status: string;
}