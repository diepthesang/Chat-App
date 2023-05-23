import { BaseEntity } from '../../../utils/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('conversations')
export class ConversationEntity extends BaseEntity {
  @Column({ name: 'name', nullable: true })
  name: string;

  // @OneToMany(() => UserEntity, (user: UserEntity) => user.id)
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity[];
}
