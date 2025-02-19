import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "@modules/auth/auth.service";
import { LoginDto, RefreshTokenDto, RegisterDto } from "@modules/auth/dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.createUser(registerDto);
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post("/refresh-token")
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return await this.authService.refreshTokens(refreshToken);
  }
}
