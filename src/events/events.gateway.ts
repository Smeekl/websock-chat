import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { UserService } from "../user/user.service";
import { AdminActionsDto, CreateMessageDto } from "../chat/dto/chat.dto";
import { ChatService } from "../chat/chat.service";
import { SocketUserRelationInterface } from "./socket-user-relation.interface";
import { UserInterface } from "./user.interface";

@WebSocketGateway()
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService
  ) {}

  @WebSocketServer()
  server: Server;
  users: SocketUserRelationInterface[] = [];
  user: UserInterface;

  private logger: Logger = new Logger("WebsocketGateway");

  @SubscribeMessage("messages")
  async handleGetMessages(): Promise<void> {
    this.server.emit("messages", await this.chatService.getMessages());
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    client: Socket,
    payload: CreateMessageDto
  ): Promise<void> {
    console.log(payload);
    //
    // if (
    //     payload.message.length > 300 ||
    //     payload.message.length === 0 ||
    //     (await this.userService.isMuted({ id: payload.userId }))
    // ) {
    //   return;
    // }

    if (
      payload.message.length <= 300 &&
      payload.message.length > 0 &&
      !(await this.userService.isMuted({ id: payload.userId }))
    ) {
      await this.userService.send(payload);
      this.server.emit("messages", await this.chatService.getMessages());
      await this.userService.updateMuteStatus(payload.userId, {
        muted: true,
      });
      const user = this.getUserById(client);
      const connection = this.server.sockets.connected[user.clientId];
      connection.emit("mute", true);
      setTimeout(() => {
        this.userService.updateMuteStatus(payload.userId, {
          muted: false,
        });
        connection.emit("mute", false);
      }, 15000);
    }
  }

  @SubscribeMessage("allUsers")
  async handleGetUsers(): Promise<void> {
    this.server.emit("allUsers", await this.userService.findAll());
  }

  @SubscribeMessage("ban")
  async handleBan(client: Socket, payload: AdminActionsDto): Promise<void> {
    if (this.isAdmin(client)) {
      await this.userService.updateBanStatus(payload.userId, {
        banned: true,
      });
      const user = this.users.find(
        ({ user }: SocketUserRelationInterface) => user.id === payload.userId
      );
      if (user) {
        const connection = this.server.sockets.connected[user.clientId];
        connection.emit("ban");
        connection.disconnect();
      }
    }
  }

  @SubscribeMessage("unban")
  async handleUnban(client: Socket, payload: AdminActionsDto): Promise<void> {
    if (this.isAdmin(client)) {
      await this.userService.updateBanStatus(payload.userId, {
        banned: false,
      });
    }
  }

  @SubscribeMessage("mute")
  async handleMute(client: Socket, payload: AdminActionsDto): Promise<void> {
    if (this.isAdmin(client)) {
      await this.userService.updateMuteStatus(payload.userId, {
        muted: true,
      });
      const user = this.users.find(
        ({ user }: SocketUserRelationInterface) => user.id === payload.userId
      );
      if (user) {
        const connection = this.server.sockets.connected[user.clientId];
        this.logger.log("- socket muted ", connection.id);
        connection.emit("mute", true);
      }
    }
  }

  @SubscribeMessage("unmute")
  async handleUnmute(client: Socket, payload: AdminActionsDto): Promise<void> {
    if (this.isAdmin(client)) {
      await this.userService.updateMuteStatus(payload.userId, {
        muted: false,
      });
      const user = this.users.find(
        ({ user }: SocketUserRelationInterface) => user.id === payload.userId
      );
      if (user) {
        const connection = this.server.sockets.connected[user.clientId];
        this.logger.log("- socket unmuted ", connection.id);
        connection.emit("unmute", false);
      }
    }
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    console.log("before", this.users.length);
    this.users = this.users.filter((user) => user.clientId !== client.id);
    console.log("after", this.users.length);
    this.logger.log(`Users Online: ${this.getOnlineUsersCount()}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.user = await this.userService.findByToken({
      token: client.request._query["token"],
    });
    if (!this.user) {
      this.server.sockets.connected[client.id].disconnect();
    } else {
      this.logger.log(`Client connected: ${client.id}`);
      this.users.push({ user: this.user, clientId: client.id });
      this.handleUserInfo(client);
      this.server.emit("messages", await this.chatService.getMessages());
      this.server.emit("onlineUsers", this.getOnlineUsers());
      this.server.emit("allUsers", await this.userService.findAll());
    }
    this.logger.log(`Users Online: ${this.getOnlineUsersCount()}`);
  }

  private handleUserInfo(client: Socket) {
    this.server.sockets.connected[client.id].emit(
      "currentUser",
      this.getCurrentUser(client).user
    );
  }

  getCurrentUser(client: Socket): SocketUserRelationInterface {
    return this.users.find(
      (user: SocketUserRelationInterface) => user.clientId === client.id
    );
  }

  getUserById(client: Socket) {
    return this.users.find(
      (user: SocketUserRelationInterface) => user.clientId === client.id
    );
  }

  getOnlineUsers(): UserInterface[] {
    return this.users.map((user: SocketUserRelationInterface) => user.user);
  }

  getOnlineUsersCount(): number {
    return this.users.length;
  }

  removeUserFromList(userId) {
    this.users = this.users.filter((user) => user.clientId !== userId);
  }

  isAdmin(client: Socket) {
    return this.users.find(
      (user: SocketUserRelationInterface) => user.clientId === client.id
    ).user.isAdmin;
  }
}
