import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/user.dto";
import { ChatService } from "../chat/chat.service";
import { CreateMessageDto } from "../chat/dto/chat.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly messagesService: ChatService
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(nickname: string): Promise<User> {
    return this.userRepository.findOne({ nickname: nickname });
  }

  findOneByNickname(nickname: string): Promise<User> {
    return this.userRepository.findOne({ nickname: nickname });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async send(message: CreateMessageDto): Promise<void> {
    await this.messagesService.send(message);
  }
}
