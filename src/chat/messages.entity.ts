import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { CreateMessageDto } from "./dto/chat.dto";
import { User } from "../user/user.entity";

@Entity()
export class Messages {
  constructor(payload: CreateMessageDto) {
    Object.assign(this, payload);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user: User) => user.userId)
  user: User;
}
