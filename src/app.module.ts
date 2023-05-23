import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { BULL_MODULE, CONFIG_MODULE, MAILER_MODULE, TYPEORM_MODULE } from "./shared-modules/some.module";
import { MessageModule } from "./modules/message/message.module";
import { GroupModule } from "./modules/group/group.module";
import { ConversationModule } from "./modules/conversation/conversation.module";
import { PrivateChatModule } from "./modules/private-chat/private-chat.module";
import { ClientModule } from "./modules/client/client.module";
import { StateUserModule } from "./modules/state-user/state-user.module";
import { AppGateway } from "./app.gateway";
import { FriendModule } from "./modules/friend/friend.module";

@Module({
  imports: [
    CONFIG_MODULE,
    BULL_MODULE,
    TYPEORM_MODULE,
    MAILER_MODULE,
    AuthModule,
    UserModule,
    AuthModule,
    MessageModule,
    GroupModule,
    ConversationModule,
    PrivateChatModule,
    ClientModule,
    StateUserModule,
    FriendModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway]
})
export class AppModule {
}
