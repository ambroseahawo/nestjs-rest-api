import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, MoreThan, QueryRunner, Repository } from "typeorm";

import { compare, hash } from "bcrypt";

import { LoginDto, RegisterDto } from "@modules/auth/dto/auth.dto";
import { RefreshToken } from "@modules/auth/entity/refreshToken";
import { User, UserRole } from "@modules/auth/entity/user";
import { InvalidCredentialsException } from "@modules/auth/exceptions/invalid-credentials.exception";

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RefreshToken) private refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async createUser(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new ConflictException("Email already registered");
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
    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "role", "password"],
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      throw new InvalidCredentialsException();
    }

    return this.getTokens(user);
  }

  async refreshTokens(token: string): Promise<JwtTokens> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      });

      const validTokens = await queryRunner.manager.find(RefreshToken, {
        where: {
          user: { id: payload.sub },
          expiresAt: MoreThan(new Date()),
          // createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Optional: Tokens issued in last 30 days
        },
      });
      if (!validTokens.length) {
        throw new InvalidCredentialsException();
      }

      // find matching refresh token
      const matchedToken = await Promise.all(
        validTokens.map(async (storedToken) => ({
          token: storedToken,
          isMatch: await compare(token, storedToken.token),
        })),
      ).then((results) => results.find((r) => r.isMatch)?.token);

      if (!matchedToken) {
        throw new InvalidCredentialsException();
      }

      const user = await this.userRepository.findOneOrFail({ where: { id: payload.sub } });

      // delete only matched token
      await queryRunner.manager.delete(RefreshToken, { id: matchedToken.id });

      // issue new tokens
      const tokens = await this.getTokens(user, queryRunner);
      await queryRunner.commitTransaction();

      return tokens;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  private async getTokens(user: User, queryRunner?: QueryRunner): Promise<JwtTokens> {
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

    const expirationTime = new Date();
    expirationTime.setSeconds(
      expirationTime.getSeconds() +
        parseInt(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRATION") ?? "3600"),
    );

    const hashedToken = await hash(refreshToken, 10);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: hashedToken,
      user,
      expiresAt: expirationTime,
    });

    if (queryRunner) {
      await queryRunner.manager.save(refreshTokenEntity);
    } else {
      await this.refreshTokenRepository.save(refreshTokenEntity);
    }

    return { accessToken, refreshToken };
  }
}
