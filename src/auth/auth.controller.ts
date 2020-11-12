import { Controller, Post, Body } from "@nestjs/common";
import { LoginUserDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(@Body() req: LoginUserDto) {
    return this.authService.login({
      nickname: req.nickname,
      password: req.password,
    });
  }
}
