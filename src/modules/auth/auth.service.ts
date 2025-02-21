import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { compare, hash } from "bcrypt";

import { LoginDto, RegisterDto } from "@modules/auth/dto/auth.dto";
import { User, UserRole } from "@modules/auth/entity/user";

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new HttpException("Email already registered", 400);
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    await this.userRepository.save({
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role ?? UserRole.USER,
    });
  }

  async login(loginDto: LoginDto): Promise<JwtTokens> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("Invalid credentials", 400);
    }

    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      throw new HttpException("Invalid credentials", 400);
    }

    return this.getTokens(user);
  }

  async refreshTokens(token: string): Promise<JwtTokens> {
    try {
      const { sub: email } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      });
      const user = await this.userRepository.findOneOrFail({ where: { email } });

      return this.getTokens(user);
    } catch (error) {
      throw new HttpException("Invalid credentials", 400);
    }
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  private async getTokens(user: User): Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, role: user.role },
        {
          secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
          expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION"),
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id, role: user.role },
        {
          secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
          expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRATION"),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
