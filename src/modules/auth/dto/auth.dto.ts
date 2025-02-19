import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

import { Match } from "@utils/match.decorator";
import { UserRole } from "../entity/user";

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  @Match("password", { message: "Passwords do not match" })
  passwordConfirm: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
