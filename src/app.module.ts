import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {
  BULL_MODULE,
  CONFIG_MODULE,
  MAILER_MODULE,
  TYPEORM_MODULE,
} from './module/some.module';
import { GoogleModule } from './google/google.module';
import { MessagesService } from './messages/service/messages.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AuthModule,
    CONFIG_MODULE,
    BULL_MODULE,
    TYPEORM_MODULE,
    MAILER_MODULE,
    GoogleModule,
    MessagesModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, MessagesService],
})
export class AppModule {}
