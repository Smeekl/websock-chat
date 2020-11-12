import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { LoginUserDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { FindUserDto } from "../user/dto/user.dto";
import { createHash } from "crypto";

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
    const accessToken = this.jwtService.sign(payload);
    if (userExist) {
      const validUser = await this.validateUser({
        nickname: user.nickname,
        password: user.password,
      });
      if (validUser) {
        if (validUser.banned) {
          throw new ForbiddenException("You banned by administrator");
        }
        await this.userService.update((await validUser).id, {
          token: accessToken,
        });
        return accessToken;
      } else {
        throw new UnauthorizedException("Credentials is incorrect");
      }
    } else if (!userExist) {
      let usernameRegex = /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
      if (
        user.nickname.match(usernameRegex) !== null &&
        user.password.match(usernameRegex) !== null
      ) {
        await this.userService.create(user);
        const validUser = await this.validateUser({
          nickname: user.nickname,
          password: createHash("sha256").update(user.password).digest("hex"),
        });
        await this.userService.update(validUser.id, { token: accessToken });
        return accessToken;
      } else if (user.nickname.length < 3) {
        throw new UnauthorizedException(
          "Nickname must contain more than 3 characters"
        );
      } else if (user.password.length <= 0) {
        throw new UnauthorizedException(
          "Password must contain more than 1 characters"
        );
      } else if (user.nickname.match(usernameRegex) === null) {
        throw new UnauthorizedException(
          "Your username is not valid. Only characters A-Z, a-z, 0-9 and should doesnt contains special characters."
        );
      } else if (user.password.match(usernameRegex) === null) {
        throw new UnauthorizedException(
          "Your password is not valid. Only characters A-Z, a-z, 0-9 and should doesnt contains special characters."
        );
      }
    }
  }
}
