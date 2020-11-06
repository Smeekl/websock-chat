import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { CreateUserDto } from "./dto/user.dto";
import { Messages } from "../chat/messages.entity";

@Entity()
export class User {
  private readonly colors: string[] = [
    "DDA5B6",
    "3F6A8A",
    "F9A26C",
    "CC2A49",
    "685D79",
    "D8737F",
    "2D142C",
    "801336",
  ];

  constructor(payload: CreateUserDto) {
    Object.assign(this, payload);
    this.color = this.getRandomColor();
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  googleId: number;

  @Column()
  nickname: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column()
  password: string;

  @Column()
  token: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  color: string;

  isOnline: boolean;

  getRandomColor(): string {
    return this.colors[Math.random() * (this.colors.length - 1)];
  }

  @OneToMany(() => Messages, (messages: Messages) => messages.user)
  messages: Messages[];
}
