import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  onlineUsersCount: number = 0;
  users: Array<string> = [];
  messages: Array<string> = [];

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('getMessages')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log("Message body.messageToServer: " + payload);
    this.messages.push(payload)
    this.logger.log(this.messages);
    this.server.emit('getMessages', this.messages);
  }

  @SubscribeMessage('getOnlineUsersCount')
  handleOnlineUsersCount(client: Socket): void {
    this.logger.log("Message body.usersOnline: " + this.onlineUsersCount);
    this.server.emit('getOnlineUsersCount', this.onlineUsersCount);
  }

  @SubscribeMessage('getUsersInfo')
  handleUserInfo(client: Socket): void {
    this.server.emit('getUsersInfo', this.users);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }


  handleDisconnect(client: Socket) {
    this.server.emit(`clientDisconnect ${client.id}`)
    this.logger.log(`Client disconnected: ${client.id}`);
    this.onlineUsersCount--;
    this.users.pop();
    this.logger.log(`Users Online: ${this.onlineUsersCount}`)
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.server.emit(`clientConnect ${client.id}`)
    this.logger.log(`Client connected: ${client.id}`);
    this.onlineUsersCount++;
    this.users.push(client.id);
    this.logger.log(`Users Online: ${this.onlineUsersCount}`)
  }
}