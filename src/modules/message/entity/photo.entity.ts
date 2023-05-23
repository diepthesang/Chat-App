import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../utils/base/base.entity';

@Entity('photos')
export class PhotoEntity extends BaseEntity {
  @Column('path_img')
  pathImg: string;
}
