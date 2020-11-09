import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { LoginUserDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
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

  async login(user: LoginUserDto) {
    const zuser = this.validateUser({
      nickname: user.nickname,
      password: user.password,
    });
    if ((await zuser) !== null) {
      const payload = { username: user.nickname, password: user.password };
      const accesToken = this.jwtService.sign(payload);
      console.log(payload);
      console.log((await zuser).token);
      console.log(accesToken);
      if ((await zuser).token === accesToken) {
        console.log("Great");
      } else {
        console.log("Crash");
      }
    } else {
      console.log("User does not exist");
    }
  }
}
