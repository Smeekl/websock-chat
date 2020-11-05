import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Messages } from "./messages.entity";
import { ChatService } from "./chat.service";

@Module({
  imports: [TypeOrmModule.forFeature([Messages])],
  exports: [TypeOrmModule],
  providers: [ChatService],
})
export class ChatModule {}
