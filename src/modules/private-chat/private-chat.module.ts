import { Module } from '@nestjs/common';
import { PrivateChatController } from './controller/private-chat.controller';
import { PrivateChatService } from './service/private-chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateChatEntity } from './entities/private-chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrivateChatEntity])],
  controllers: [PrivateChatController],
  providers: [PrivateChatService],
  exports: [PrivateChatService],
})
export class PrivateChatModule {}
