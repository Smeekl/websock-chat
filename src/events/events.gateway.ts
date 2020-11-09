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
  user: {};

  private logger: Logger = new Logger("WebsocketGateway");

  @SubscribeMessage("getMessages")
  async handleGetMessages(client: Socket): Promise<void> {
    let response = await this.chatService.getMessages();
    console.log(response);
    this.server.emit("getMessages", response);
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
  handleOnlineUsersCount(): void {
    this.logger.log("Message body.usersOnline: " + this.onlineUsersCount);
    this.server.emit("getOnlineUsersCount", this.onlineUsersCount);
  }

  @SubscribeMessage("getUsersInfo")
  handleUserInfo(): void {
    this.server.emit("getUsersInfo", this.users);
  }

  @SubscribeMessage("getUsers")
  async handleGetUsers(client: Socket): Promise<void> {
    console.table(await this.userService.findAll());
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    this.onlineUsersCount--;
    this.users.pop();
    this.handleOnlineUsersCount();
    this.handleUserInfo();
    this.logger.log(`Users Online: ${this.onlineUsersCount}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.onlineUsersCount++;
    this.users.push(client.id);
    this.handleOnlineUsersCount();
    this.handleUserInfo();
    this.logger.log(`Users Online: ${this.onlineUsersCount}`);
  }
}
