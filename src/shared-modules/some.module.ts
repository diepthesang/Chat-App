import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MessageEntity } from "../modules/message/entity/message.entity";
import { ConversationEntity } from "../modules/conversation/entity/conversation.entity";
import { GroupEntity } from "../modules/group/entity/group.entity";
import { PrivateChatEntity } from "../modules/private-chat/entities/private-chat.entity";
import { ClientEntity } from "../modules/client/entity/client.entity";
import { StateUserEntity } from "../modules/state-user/entity/state-user.entity";
import { FriendEntity } from "../modules/friend/entity/friend.entity";

export const TYPEORM_MODULE = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: "mysql",
    host: configService.get<string>("MYSQL_HOST"),
    port: configService.get<number>("MYSQL_PORT"),
    username: configService.get<string>("MYSQL_USERNAME"),
    password: configService.get<string>("MYSQL_PASSWORD"),
    database: configService.get<string>("MYSQL_DB"),
    entities: [
      UserEntity,
      MessageEntity,
      ConversationEntity,
      GroupEntity,
      PrivateChatEntity,
      ClientEntity,
      StateUserEntity,
      FriendEntity
    ],
    synchronize: true,
    autoLoadEntities: true,
    cache: false
  })
});

export const BULL_MODULE = BullModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get<string>("REDIS_HOST"),
      port: configService.get<number>("REDIS_PORT")
      // password: configService.get<string>('REDIS_PASSWORD'),
    }
  })
});

// config shared-modules
export const CONFIG_MODULE = ConfigModule.forRoot({
  envFilePath: ".env",
  isGlobal: true,
  ignoreEnvFile: false
});

//mailer shared-modules
export const MAILER_MODULE = MailerModule.forRootAsync({
  imports: [ConfigModule], // import shared-modules if not enabled globally
  useFactory: async (config: ConfigService) => ({
    // transport: config.get("MAIL_TRANSPORT"),
    // or
    transport: {
      host: config.get("MAIL_HOST"),
      secure: false,
      auth: {
        user: config.get("MAIL_USER"),
        pass: config.get("MAIL_PASSWORD")
      }
    },
    defaults: {
      from: `"No Reply" <${config.get("MAIL_FROM")}>`
    },
    template: {
      dir: join(__dirname, "templates"),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true
      }
    }
  }),
  inject: [ConfigService]
});
