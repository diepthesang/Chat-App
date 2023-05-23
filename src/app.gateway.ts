import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { JwtStrategy } from "./modules/auth/service/passport/strategy/jwt.strategy";
import { UserService } from "./modules/user/service/user.service";
import { Server, Socket } from "socket.io";
import { MessageService } from "./modules/message/service/message.service";
import { AuthService } from "./modules/auth/service/auth.service";
import { MessageEntity } from "./modules/message/entity/message.entity";
import { ConversationService } from "./modules/conversation/service/conversation.service";
import { PrivateChatService } from "./modules/private-chat/service/private-chat.service";
import { GroupService } from "./modules/group/service/group.service";
import { GroupEntity } from "./modules/group/entity/group.entity";
import { ClientService } from "./modules/client/client.service";
import { ClientEntity } from "./modules/client/entity/client.entity";
import { SendMessageDto } from "./modules/private-chat/dto/send-message.dto";
import { UseGuards } from "@nestjs/common";
import { SocketGuard } from "./modules/auth/service/passport/socket/guard/auth.guard";
import { StateUserService } from "./modules/state-user/state-user.service";
import { stateEnum } from "./modules/state-user/entity/state-user.entity";
import { FriendService } from "./modules/friend/service/friend.service";

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtStrategy: JwtStrategy,
    private readonly userService: UserService,
    private readonly chatsService: MessageService,
    private readonly authService: AuthService,
    private readonly conversationService: ConversationService,
    private readonly privateChatService: PrivateChatService,
    private readonly groupService: GroupService,
    private readonly clientService: ClientService,
    private readonly stateUserService: StateUserService,
    private readonly friendService: FriendService
  ) {
  }

  async handleConnection(client: any, ...args: any[]) {
    try {
      console.log({ connected: client.id });

      const payload = await this.jwtStrategy.verifyBearerAccessToken(client.handshake.auth.token);

      if (!payload || Object.keys(payload).length === 0) return this.handleDisconnect(client);

      // update info for client
      client.data.socketId = client.id;
      client.data.clientId = payload.userId;

      // kiem tra xem con user noa khac dang online khong neu khong thi disconnect het
      await this.clientService.deleteDisconnectedClients(payload.userId);

      await this.clientService.createOne<ClientEntity>({
        clientId: client.data.clientId,
        socketId: client.data.socketId
      });

      // update state user
      await this.stateUserService.updateStateUser({ userId: payload.userId, state: stateEnum.ONLINE, offlineAt: null });

      client.join(client.id);
    } catch (error) {
      console.log({ err_handleConnection: error.message });
      console.log({ socketId_connect: client.id });
      if (client.id && error.message === "jwt expired") this.server.to(client.id).emit("error", error.message);
      return error;
    }
  }

  async handleDisconnect(client: any) {
    try {
      console.log("disconnect socket ><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

      console.log({ ___disconnect: client.data.socketId, clientId: client.data.clientId });

      if (!client.data.socketId || !client.data.clientId) return;

      await this.stateUserService.updateStateUser({
        userId: `${client.data.clientId}`,
        state: stateEnum.OFFLINE,
        offlineAt: new Date()
      });

      // xoa clientId ra khoi list online
      const clientIsSoftDeleted = await this.clientService.softDeleteOneBy({
        socketId: client.data.socketId
      });

      console.log({ clientIsSoftDeleted });

      console.log({ clientId: client.data.clientId });

      console.log("disconnect");

      return;
    } catch (error) {
      console.log({ err_in_handleDisconnect: error.message });
    }
  }

  afterInit(server: any): any {
    return;
  }

  @SubscribeMessage("refresh_token")
  async listenForRefreshToken(@MessageBody() bearerRefreshToken: string, @ConnectedSocket() client: Socket) {
    console.log("vao listenForRefreshToken");
    try {
      const accessToken =
        await this.authService.socketRetrieveAccessTokenByRefreshToken(
          bearerRefreshToken
        );

      this.server
        .to(client.id)
        .emit("refresh_token", accessToken);

      return "success";
    } catch (error) {
      // this.server.to(client.id).emit("error", error.message);
      console.log({ err_listenForRefreshToken: error });
      return error.message;
    }
  }

  @SubscribeMessage("chat")
  @UseGuards(SocketGuard)
  async listenEventChat(@ConnectedSocket() client: Socket, @MessageBody() message: SendMessageDto) {
    // kiem tra xem co fai ban be khong
    const areFriends = await this.friendService.checkAreFriends({
      firstUserId: client.data.clientId,
      secondUserId: message.receiverId
    });

    if (!areFriends) return "error_not_friends";

    const { id: senderId } = await this.userService.findOneBy({ id: client.data.clientId });

    const { id: conversationId } = await this.conversationService.findOneBy({ id: message.conversationId });

    if (!senderId && !conversationId) return "error_user_is_blocked";

    // bo tin nhan vao
    await this.chatsService.createOne<MessageEntity>({
      conversation: conversationId,
      sender: senderId,
      text: message.text
    });

    const lastMessage = await this.chatsService.getLastMessageByConversationId(conversationId);

    if (!lastMessage || Object.keys(lastMessage).length === 0) return "null_msg";

    // lay tat ca thanh vien trong cuoc hoi thoai
    const members = await this.groupService.getMembersInConversation(conversationId);

    const listReceiverId = [];
    members.forEach((item: GroupEntity) => {
      listReceiverId.push(item.member.id);
    });

    const listSocketId = [];
    for (const client of listReceiverId) {
      const socketId = await this.clientService.getSocketIdByClientId(client);
      listSocketId.push(socketId);
    }

    const _listSocketId = [];
    listSocketId.forEach((item) => {
      item.forEach((client) => {
        _listSocketId.push(client.socketId);
      });
    });

    this.server.to([..._listSocketId]).emit("chat", lastMessage);

    return "success";
  }

  @SubscribeMessage("user_state")
  @UseGuards(SocketGuard)
  async listenUsersOnline(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    try {
      // phat su kien toi client de thong bao user online
      const users = await this.stateUserService.getUserStates();

      if (!users || Object.keys(users).length === 0) return;

      this.server.to(client.id).emit("user_state", users);

      // chi phat toi chinh no ma thoi

      const usersOffline = await this.clientService.getUsersOffline();

      const usersState = await this.clientService.getUsersState();

      const _usersState = usersState.map(user => {
        if (user.client_deleted_at === null || !user.client_deleted_at) {
          delete user.client_deleted_at;
          return { ...user, state: "online" };
        } else {
          user.offlineAt = Date.now() - user.client_deleted_at;
          delete user.client_deleted_at;
          return { ...user, state: "offline" };
        }
      });
      return;
    } catch (error) {
      console.log({ error_user_online: error });
      return error.message;
    }
  }

  @SubscribeMessage("users_state")
  @UseGuards(SocketGuard)
  async listenUsersState(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string) {
    try {

      // phat su kien toi client de thong bao user online

      const usersState = await this.clientService.getUsersState();

      // chi phat toi


      console.log({ usersState });

      // if (!usersOffline || usersOffline.length === 0) return;

      // this.server.emit("users_offline", usersOffline);
      return;
    } catch (error) {
      return error.message;
    }
  };


}
