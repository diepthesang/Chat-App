import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { BaseEntity } from 'src/base/base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

// @Injectable()
export class BaseService<Entity extends BaseEntity> {
  constructor(protected repository: Repository<Entity>) {}

  async findOneBy(property: Partial<Entity>): Promise<Entity> {
    try {
      return await this.repository.findOneBy(
        property as FindOptionsWhere<Entity>,
      );
    } catch (error) {
      return error;
    }
  }

  async softDeleteOneBy(property: Partial<Entity>): Promise<any> {
    try {
      return await this.repository.softDelete(
        property as FindOptionsWhere<Entity>,
      );
    } catch (error) {
      return error;
    }
  }

  async hardDeleteOneBy(property: Partial<Entity>): Promise<any> {
    try {
      return await this.repository.delete(property as FindOptionsWhere<Entity>);
    } catch (error) {
      return error;
    }
  }

  async findAll(): Promise<Entity[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      return error;
    }
  }

  async createOne<Entity>(data: DeepPartial<Entity>) {
    try {
      return await this.repository.save(data as any);
    } catch (error) {
      return error;
    }
  }

  async updateOneBy(
    property: Partial<Entity>,
    data: Partial<Entity>,
  ): Promise<any> {
    const one = await this.repository.findOneBy(
      property as FindOptionsWhere<Entity>,
    );
    try {
      return await this.repository.update(
        property as FindOptionsWhere<Entity>,
        { ...one, ...(data as QueryDeepPartialEntity<Entity>) },
      );
    } catch (error) {
      return error;
    }
  }
}
