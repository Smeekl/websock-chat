import { Length, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @Length(3, 30)
  nickname: string;
  @IsNotEmpty()
  password: string;
}

export class FindUserDto {
  nickname: string;
}

export class UpdateUserTokenDto {
  token: string;
}

export class FindByTokenDto {
  token: string;
}
