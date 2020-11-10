import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { LoginUserDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { response } from "express";
import { FindUserDto } from "../user/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(userDto: LoginUserDto): Promise<User> {
    const user = await this.userService.findOne({ nickname: userDto.nickname });
    if (
      user.nickname === userDto.nickname &&
      user.password === userDto.password
    ) {
      return user;
    }
    return null;
  }

  async exist(user: FindUserDto) {
    return (await this.userService.findOne(user)) !== undefined;
  }

  async login(user: LoginUserDto) {
    const payload = { username: user.nickname, password: user.password };
    const userExist = await this.exist({ nickname: user.nickname });
    const accesToken = this.jwtService.sign(payload);
    console.log(userExist);
    if (userExist) {
      const validUser = await this.validateUser({
        nickname: user.nickname,
        password: user.password,
      });
      if (!validUser) {
        console.log("update");
        await this.userService.update((await validUser).id, {
          token: accesToken,
        });
        return accesToken;
      } else {
        return response.status(401);
      }
    } else if (!userExist) {
      console.log(
        await this.userService.findOne({
          nickname: "asdasd",
        })
      );
      console.log(await this.userService.create(user));
      // const validUser = await this.validateUser({
      //   nickname: user.nickname,
      //   password: user.password,
      // });
      // await this.userService.update(validUser.id, { token: accesToken });
    }
  }
}
