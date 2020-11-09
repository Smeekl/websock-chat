import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { Messages } from "./messages.entity";
import { CreateMessageDto } from "./dto/chat.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Messages)
    private messagesRepository: Repository<Messages>
  ) {}

  async getMessages(): Promise<any[]> {
    const response = await this.messagesRepository.find({
      join: {
        alias: "messages",
        innerJoinAndSelect: {
          user: "messages.user",
        },
      },
      order: {
        createdAt: "ASC",
      },
    });

    return response.reduce((acc, item) => {
      acc.push({
        message: item.message,
        createdAt: new Date(item.createdAt).toLocaleString(),
        color: item.user.color,
        nickname: item.user.nickname,
      });

      return acc;
    }, []);
  }

  send(createMessageDto: CreateMessageDto): Promise<InsertResult> {
    const message = new Messages(createMessageDto);
    return this.messagesRepository.insert(message);
  }
}
