import { Expose } from 'class-transformer';

export abstract class BaseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  deletedAt: string;

  // static plainToInstance<T>(this: new (...args: any[]) => T, obj: T): T {
  //   return plainToInstance(this, obj, { excludeExtraneousValues: true });
  // }
}
