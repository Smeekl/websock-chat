import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Messages } from "../chat/messages.entity";
import { LoginUserDto } from "../auth/dto/auth.dto";
import { createHash } from "crypto";

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

  constructor(payload?: LoginUserDto) {
    if (payload) {
      Object.assign(this, {
        ...payload,
        color: this.getRandomColor(),
        password: createHash("sha256").update(payload.password).digest("hex"),
      });
    }
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

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  color: string;

  @Column({ default: false })
  banned: boolean;

  @Column({ default: false })
  muted: boolean;

  isOnline: boolean;

  getRandomColor(): string {
    return this.colors[(Math.random() * (this.colors.length - 1)).toFixed(0)];
  }

  @OneToMany(() => Messages, (messages: Messages) => messages.user)
  userId: Messages[];
}
