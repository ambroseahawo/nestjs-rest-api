import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "@modules/auth/auth.service";
import { RegisterDto } from "@modules/auth/dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.createUser(registerDto);
  }
}
