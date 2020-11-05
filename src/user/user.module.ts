import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ChatService } from "../chat/chat.service";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), ChatModule],
  exports: [TypeOrmModule],
  providers: [UserService, ChatService],
  controllers: [UserController],
})
export class UserModule {}
