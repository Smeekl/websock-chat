import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { UserService } from "../user/user.service";
import { CreateMessageDto } from "../chat/dto/chat.dto";
import { ChatService } from "../chat/chat.service";
import { response } from "express";
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

  @SubscribeMessage("getMessages")
  async handleGetMessages(client: Socket): Promise<void> {
    let response = await this.chatService.getMessages();
    this.server.emit("getMessages", response);
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    client: Socket,
    payload: CreateMessageDto
  ): Promise<void> {
    await this.userService.send(payload);
  }

  @SubscribeMessage("getOnlineUsersCount")
  handleOnlineUsersCount(): void {
    this.logger.log("Message body.usersOnline: " + this.getOnlineUsers());
    this.server.emit("getOnlineUsersCount", this.getOnlineUsers());
  }

  @SubscribeMessage("getUserInfo")
  handleGetUserInfo(client: Socket): void {
    this.server.sockets.connected[client.id].emit(
      "getUserInfo",
      this.getCurrentUser(client).user
    );
  }

  @SubscribeMessage("getUsersInfo")
  handleUserInfo(): void {
    this.server.emit("getUsersInfo", this.getAllUsers());
  }

  @SubscribeMessage("getUsers")
  async handleGetUsers(client: Socket): Promise<void> {
    console.table(await this.userService.findAll());
  }

  @SubscribeMessage("authorize")
  async handleGetToken(client: Socket, payload): Promise<void> {
    this.user = await this.userService.findByToken({ token: payload });
    if (this.user === undefined) {
      this.server.emit("authorize", response.status(401));
      this.server.sockets.connected[client.id].disconnect();
    } else {
      this.logger.log(`Client connected: ${client.id}`);
      this.users.push({ user: this.user, clientId: client.id });
      this.handleOnlineUsersCount();
      this.handleUserInfo();
      this.logger.log(this.users);
    }
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    this.users = this.users.filter((user) => user.clientId !== client.id);
    this.handleOnlineUsersCount();
    this.handleUserInfo();
    this.logger.log(`Users Online: ${this.getOnlineUsers()}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    // client.disconnect();
    this.logger.log(`Users Online: ${this.getOnlineUsers()}`);
  }

  getCurrentUser(client: Socket): SocketUserRelationInterface {
    return this.users.find(
      (user: SocketUserRelationInterface) => user.clientId === client.id
    );
  }

  getAllUsers(): UserInterface[] {
    return this.users.map((user: SocketUserRelationInterface) => user.user);
  }

  getOnlineUsers(): number {
    return this.users.length;
  }
}
