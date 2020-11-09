import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { UserService } from "../user/user.service";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ChatService } from "../chat/chat.service";
import { ChatModule } from "../chat/chat.module";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    PassportModule,
    UserModule,
    ChatModule,
    JwtModule.register({
      secret: "websocketSecret",
      signOptions: { expiresIn: "60s" },
    }),
  ],
  providers: [AuthService, UserService, ChatService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
