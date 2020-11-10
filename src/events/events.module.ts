import { Module } from "@nestjs/common";
import { EventGateway } from "./events.gateway";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { ChatService } from "../chat/chat.service";
import { ChatModule } from "../chat/chat.module";


@Module({
  imports: [UserModule, ChatModule],
  providers: [EventGateway, UserService, ChatService],
})
export class EventsModule {}
