import { Module } from "@nestjs/common";
import { StateUserController } from "./state-user.controller";
import { StateUserService } from "./state-user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StateUserEntity } from "./entity/state-user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([StateUserEntity])],
  controllers: [StateUserController],
  providers: [StateUserService],
  exports: [StateUserService]
})
export class StateUserModule {
}
