import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { CreateMessageDto } from "./dto/chat.dto";

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
}
