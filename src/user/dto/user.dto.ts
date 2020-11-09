export class CreateUserDto {
  nickname: string;
  password: string;
}

export class FindUserDto {
  nickname: string;
}

export class UpdateUserTokenDto {
  token: string;
}
