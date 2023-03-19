import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  async deleteUserByDate() {
    return await this.repository.find({
      where: {
        createdAt: LessThan(new Date('2023-02-25 14:46:17.215770')),
      },
    });
  }
}
