import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../utils/base/base.entity";


export enum stateEnum {
  ONLINE = "online",
  OFFLINE = "offline"
}

@Entity({ name: "state-users" })
export class StateUserEntity extends BaseEntity {

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "state", type: "enum", default: stateEnum.OFFLINE, enum: stateEnum })
  state: string;

  @Column({ name: "offline_at", default: null })
  offlineAt?: Date;
}


