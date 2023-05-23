import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { BaseEntity } from "src/utils/base/base.entity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { InternalServerErrorException } from "@nestjs/common";

export class BaseService<Entity extends BaseEntity> {
  constructor(protected repository: Repository<Entity>) {
  }

  async findOneBy(property: Partial<Entity>): Promise<Entity | any> | null {
    try {
      return await this.repository.findOneBy(
        property as FindOptionsWhere<Entity>
      );
    } catch (error) {
      console.log({ error_findOneBy: error });
      throw new InternalServerErrorException();
    }
  }

  async softDeleteOneBy(property: Partial<Entity>): Promise<any> {
    try {
      return await this.repository.softDelete(
        property as FindOptionsWhere<Entity>
      );
    } catch (error) {
      console.log({ error_softDeleteOneBy: error });
      throw new InternalServerErrorException();
    }
  }

  async hardDeleteOneBy(property: Partial<Entity>): Promise<any> {
    try {
      return await this.repository.delete(property as FindOptionsWhere<Entity>);
    } catch (error) {
      console.log({ error_hardDeleteOneBy: error });
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<Entity[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      console.log({ error_findAll: error });
      throw new InternalServerErrorException();
    }
  }

  async createOne<Entity>(data: DeepPartial<Entity>) {
    try {
      return await this.repository.save(data as any);
    } catch (error) {
      console.log({ error_createOne: error });
      throw new InternalServerErrorException();
    }
  }

  async updateOneBy(property: Partial<Entity>, data: Partial<Entity>): Promise<any> {
    const one = await this.repository.findOneBy(property as FindOptionsWhere<Entity>);
    try {
      return await this.repository.update(
        property as FindOptionsWhere<Entity>,
        { ...one, ...(data as QueryDeepPartialEntity<Entity>) }
      );
    } catch (error) {
      console.log({ error_updateOneBy: error });
      throw new InternalServerErrorException();
    }
  }
}
