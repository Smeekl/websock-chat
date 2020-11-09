import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto, FindUserDto, UpdateUserTokenDto } from "./dto/user.dto";
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

  findOne(user: FindUserDto): Promise<User> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.nickname =: nickname", { nickname: user.nickname })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(
    id: number,
    updateUserTokenDto: UpdateUserTokenDto
  ): Promise<void> {
    await this.userRepository.update(id, updateUserTokenDto);
  }

  async send(message: CreateMessageDto): Promise<void> {
    await this.messagesService.send(message);
  }
}
