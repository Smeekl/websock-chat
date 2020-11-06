import { Module } from "@nestjs/common";
import { EventGateway } from "./events.gateway";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { ChatService } from "../chat/chat.service";
import { ChatModule } from "../chat/chat.module";
import { AuthService } from "../auth/auth.service";

@Module({
  imports: [UserModule, ChatModule],
  providers: [EventGateway, UserService, ChatService, AuthService],
})
export class EventsModule {}
