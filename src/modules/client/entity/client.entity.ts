import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../utils/base/base.entity";

@Entity("clients")
export class ClientEntity extends BaseEntity {
  // @ManyToOne(() => UserEntity, (user) => user.id)
  @Column({ name: "client_id", length: 100, nullable: false })
  clientId: string;

  @Column({ name: "socket_id", length: 100, nullable: false })
  socketId: string;
}
