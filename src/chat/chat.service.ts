import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { Messages } from "./messages.entity";
import { CreateMessageDto } from "./dto/chat.dto";
import { User } from "../user/user.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Messages)
    private messagesRepository: Repository<Messages>
  ) {}

  getMessages(): Promise<Messages[]> {
    // return this.messagesRepository.query(
    //   "SELECT messages.message, messages.createdAt, user.nickname, user.color FROM websocket_chat.messages\n" +
    //     "INNER JOIN websocket_chat.user ON messages.userId = user.id;"
    // );
    return this.messagesRepository.find({
      join: {
        alias: "messages",
        leftJoinAndSelect: {
          user: "messages.user",
        },
      },
    });

    // const message = this.getMessages();
    // message.user.name;
    // message.user.googleId;
    //
    // return {
    //   name: message.user.name,
    //   text: message.text,
    // };
  }

  send(createMessageDto: CreateMessageDto): Promise<InsertResult> {
    const message = new Messages(createMessageDto);
    return this.messagesRepository.insert(message);
  }
}
