import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StateUserEntity } from "./entity/state-user.entity";
import { BaseService } from "../../utils/base/base.service";

@Injectable()
export class StateUserService extends BaseService<StateUserEntity> {
  constructor(
    @InjectRepository(StateUserEntity)
    private readonly userStateRepository: Repository<StateUserEntity>
  ) {
    super(userStateRepository);
  }

  async updateStateUser(stateUser: { userId: string, state?: string, offlineAt?: Date }) {
    try {
      // check before create
      const isExistUser = await this.findOneBy({ userId: stateUser.userId });

      if (!isExistUser || Object.keys(isExistUser).length === 0) {
        return await this.createOne<StateUserEntity>(stateUser);
      } else {
        return await this.userStateRepository.update({ userId: stateUser.userId }, { ...stateUser });
      }
    } catch (error) {
      console.log({ err_updateStateUser: error });
      throw new InternalServerErrorException();
    }
  }

  async getUserStates() {
    try {
      return await this.userStateRepository
        .createQueryBuilder("userState")
        .select(["userState.userId", "userState.state", "userState.offlineAt"])
        .getMany();
    } catch (error) {
      console.log({ error_getUserStates: error });
      throw new InternalServerErrorException();
    }
  }

}
