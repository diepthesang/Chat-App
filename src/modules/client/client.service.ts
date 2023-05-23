import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { BaseService } from "../../utils/base/base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { ClientEntity } from "./entity/client.entity";
import { UserEntity } from "../user/entity/user.entity";

@Injectable()
export class ClientService extends BaseService<ClientEntity> implements OnModuleInit {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>
  ) {
    super(clientRepository);
  }

  async onModuleInit() {
    try {
      console.log("init module");
      const _obj = { _name: false, age: 13 };
      console.log({ show: Object.keys(_obj).length });
      if (!_obj) console.log("this is name");
    } catch (error) {
      console.log({ error_onModuleInit: error.message });
    }
  }

  async getSocketIdByClientId(clientId: string) {
    try {
      return await this.clientRepository
        .createQueryBuilder("client")
        .where("client.clientId = :clientId", {
          clientId: clientId
        })
        .select(["client.socketId"])
        .getMany();
    } catch (error) {
      console.log({ error_getSocketIdByClientId: error.message });
      throw error;
    }
  }

  async getUsersOnline() {
    try {
      return await this.clientRepository
        .createQueryBuilder("client")
        .withDeleted()
        // .groupBy("client.clientId")
        // .addGroupBy("client.deletedAt")
        // .addGroupBy("client.socketId")
        .innerJoin(UserEntity, "user", "user.id = client.clientId")
        // .where("client.deletedAt = :deletedAt", {
        //   deletedAt: null
        // })
        .select(["client.clientId", "client.socketId", "client.deletedAt"])
        .getRawMany();
    } catch (error) {
      console.log({ error_getUsersOnline: error });
      throw new InternalServerErrorException();
    }
  }

  async deleteDisconnectedClients(clientId: string) {
    try {
      return await this.clientRepository.delete({ clientId: clientId, deletedAt: Not(IsNull()) });
    } catch (error) {
      console.log({ error_deleteDisconnectedClients: error });
      throw new InternalServerErrorException();
    }
  }

  async getUsersOffline() {
    try {
      return await this.clientRepository.find({
        order: { deletedAt: "desc" },
        where: {
          deletedAt: Not(IsNull())
        }
      });
    } catch (error) {
      console.log({ err_getUsersOffline: error.message });
      throw new InternalServerErrorException();
    }
  }

  async getUsersState() {
    try {
      return await this.clientRepository
        .createQueryBuilder("client")
        .withDeleted()
        .innerJoin(UserEntity, "user", "user.id = client.clientId")
        .select(["user.id", "user.firstName", "user.lastName", "user.avtImgPath", "client.socketId", "client.deletedAt"])
        .getRawMany();
    } catch (error) {
      console.log({ error_getUsersState: error.message });
      throw new InternalServerErrorException();
    }
  }


  async deleteClients() {
    try {
      return await this.clientRepository.createQueryBuilder("client").delete().execute();
    } catch (error) {
      console.log({ error_deleteClients: error.message });
      throw error;
    }
  }

  async getAllSocketIdByClientId(clientId: string) {
    try {
      return await this.clientRepository.find({ select: { socketId: true }, where: { clientId } });
    } catch (error) {
      console.log({ error_getAllSocketIdByClientId: error });
    }
  }


}

