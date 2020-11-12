import { Length, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @Length(3, 20)
  nickname: string;
  @IsNotEmpty()
  password: string;
}

export class CreateAdminDto {
  @Length(3, 20)
  nickname: string;
  @IsNotEmpty()
  password: string;
  isAdmin: boolean;
}

export class FindUserDto {
  nickname: string;
}

export class FindUserByIdDto {
  id: number;
}

export class UpdateUserTokenDto {
  token: string;
}

export class FindByTokenDto {
  token: string;
}

export class UpdateMuteStatusDto {
  muted: boolean;
}

export class UpdateBanStatusDto {
  banned: boolean;
}
