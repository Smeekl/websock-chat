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

  getMessages(): Promise<Messages[]> {
    return this.messagesRepository.find();
  }

  send(createMessageDto: CreateMessageDto): Promise<InsertResult> {
    const message = new Messages(createMessageDto);
    return this.messagesRepository.insert(message);
  }
}
