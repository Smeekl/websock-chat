import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository, SelectQueryBuilder } from "typeorm";
import { User } from "./user.entity";
import {
  CreateUserDto,
  FindByTokenDto,
  FindUserByIdDto,
  FindUserDto,
  UpdateBanStatusDto,
  UpdateMuteStatusDto,
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
    const user = new User(createUserDto);
    return this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user)
      .execute();
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOneById(user: FindUserByIdDto): Promise<User> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.id = :id", { id: user.id })
      .getOne();
  }

  findOne(user: FindUserDto): Promise<User> {
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
    await this.userRepository.update(id, updateUserTokenDto);
  }

  async updateMuteStatus(
    id: number,
    updateMuteStatusDto: UpdateMuteStatusDto
  ): Promise<void> {
    await this.userRepository.update(id, updateMuteStatusDto);
  }

  async updateBanStatus(
    id: number,
    updateBanStatusDto: UpdateBanStatusDto
  ): Promise<void> {
    await this.userRepository.update(id, updateBanStatusDto);
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

  async isAdmin(user: FindUserDto): Promise<boolean> {
    return (await this.findOne(user)) !== undefined;
  }

  async isBanned(user: FindByTokenDto): Promise<boolean> {
    return (await this.findByToken(user)).banned;
  }

  async isMuted(user: FindByTokenDto): Promise<boolean> {
    return (await this.findByToken(user)).muted;
  }
}
