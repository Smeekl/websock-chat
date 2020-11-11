import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { UpdateUserTokenDto } from "./dto/user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":nickname")
  findOne(@Param("nickname") nickname: string): Promise<User> {
    return this.userService.findOne({ nickname: nickname });
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Put(":id")
  updateUserToken(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserTokenDto
  ) {
    return this.userService.update(id, updateUserDto);
  }
}
