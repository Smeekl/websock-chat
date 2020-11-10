import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository, SelectQueryBuilder } from "typeorm";
import { User } from "./user.entity";
import {
  CreateUserDto,
  FindByTokenDto,
  FindUserDto,
  UpdateUserTokenDto,
} from "./dto/user.dto";
import { ChatService } from "../chat/chat.service";
import { CreateMessageDto } from "../chat/dto/chat.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly messagesService: ChatService
  ) {}

  public create(createUserDto: CreateUserDto) {
    console.log(555);
    try {
      console.log("here we go");
      const user = new User(createUserDto);
      console.log();
      return this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(user)
        .execute();
    } catch (e) {
      console.log(e.messag);
    }
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(user: FindUserDto): Promise<User> {
    console.log(123);
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.nickname = :nickname", { nickname: user.nickname })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(
    id: number,
    updateUserTokenDto: UpdateUserTokenDto
  ): Promise<void> {
    console.log(1234);
    await this.userRepository.update(id, updateUserTokenDto);
  }

  async send(message: CreateMessageDto): Promise<void> {
    await this.messagesService.send(message);
  }

  async findByToken(tokenDto: FindByTokenDto): Promise<User> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.token = :token", { token: tokenDto.token })
      .getOne();
  }
}
