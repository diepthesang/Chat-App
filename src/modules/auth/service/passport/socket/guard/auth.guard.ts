import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtStrategy } from "../../strategy/jwt.strategy";

@Injectable()
export class SocketGuard implements CanActivate {
  constructor(private readonly jwtStrategy: JwtStrategy) {
  }

  async canActivate(context: ExecutionContext) {
    const server = (context as any).args[0].server;
    const socket = context.switchToWs().getClient();
    const client = (context as any).getClient();

    // console.log({ type: typeof (context as any).handler });
    // console.log({ context: (context as any) });

    // bat ten emit
    // const listeners = client.listenersAnyOutgoing();
    // console.log({ listeners });

    try {
      const bearerAccessToken = (context as any).args[0].handshake.auth.token;

      const payload =
        this.jwtStrategy.verifyBearerAccessToken(bearerAccessToken);

      return !(!payload || Object.keys(payload).length === 0);
    } catch (error) {
      server.on("chat", (data: any, cb: any) => {
          cb("loi roi nek");
        }
      );
      console.log({ error_canActivate: error.message });
      if (error.message === "jwt expired") server.to(socket.id).emit("error", `${error.message}`);
      return false;
    }
  }
}
