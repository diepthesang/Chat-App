import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MessageEntity } from '../../messages/entity/message.entity';

export const statusEnum = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DELETED: 'deleted',
};

export const typeLoginEnum = {
  LOCAL: 'local',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  GITHUB: 'github',
};

export const roleEnum = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
};

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  email: string;

  @Column({ name: 'hash_password', length: 100, nullable: true })
  hashPassword: string;

  @Column({ name: 'first_name', length: 30, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 30, nullable: true })
  lastName: string;

  @Column({
    name: 'user_name',
    nullable: true,
    length: 30,
  })
  userName: string;

  @Column({
    name: 'avt_img_path',
    nullable: true,
    length: 255,
  })
  avtImgPath: string;

  @Column({
    name: 'date_of_birth',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @Column({ name: 'address_id', nullable: true })
  addressId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'refresh_token',
    nullable: true,
    length: 255,
  })
  refreshToken: string;

  @Column({
    name: 'validate_otp',
    nullable: true,
    length: 10,
  })
  validateOTP: string;

  @Column({
    type: 'enum',
    name: 'status',
    default: statusEnum.ACTIVE,
    enum: statusEnum,
  })
  status: string;

  @Column({ name: 'type_login', default: typeLoginEnum.LOCAL, length: 15 })
  typeLogin: string;

  @Column({
    name: 'times_validate_otp',
    default: 3,
    nullable: false,
  })
  timesValidateOTP: number;

  @Column({ name: 'role', default: roleEnum.USER, length: 15 })
  role: string;

  @ManyToOne(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages: MessageEntity[];
}
