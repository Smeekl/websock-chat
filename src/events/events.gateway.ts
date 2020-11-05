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

@WebSocketGateway()
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService
  ) {}

  @WebSocketServer()
  server: Server;
  onlineUsersCount: number = 0;
  users: Array<string> = [];
  messages: Array<string> = [];

  private logger: Logger = new Logger("AppGateway");

  @SubscribeMessage("getMessages")
  async handleGetMessages(client: Socket): Promise<void> {
    console.table(await this.chatService.getMessages());
    await this.server.emit("getMessages", this.chatService.getMessages());
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    client: Socket,
    payload: CreateMessageDto
  ): Promise<void> {
    this.logger.log("Message body.messageToServer: " + payload);
    await this.userService.send(payload);
  }

  @SubscribeMessage("getOnlineUsersCount")
  handleOnlineUsersCount(client: Socket): void {
    this.logger.log("Message body.usersOnline: " + this.onlineUsersCount);
    this.server.emit("getOnlineUsersCount", this.onlineUsersCount);
  }

  @SubscribeMessage("getUsersInfo")
  handleUserInfo(client: Socket): void {
    this.server.emit("getUsersInfo", this.users);
  }

  @SubscribeMessage("getUsers")
  async handleGetUsers(client: Socket): Promise<void> {
    console.log(await this.userService.findAll());
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    this.server.emit(`clientDisconnect ${client.id}`);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.onlineUsersCount--;
    this.users.pop();
    this.logger.log(`Users Online: ${this.onlineUsersCount}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.server.emit(`clientConnect ${client.id}`);
    this.logger.log(`Client connected: ${client.id}`);
    this.onlineUsersCount++;
    this.users.push(client.id);
    this.logger.log(`Users Online: ${this.onlineUsersCount}`);
  }
}
