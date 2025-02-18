import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { hash } from "bcrypt";

import { RegisterDto } from "@modules/auth/dto/auth.dto";
import { User, UserRole } from "@modules/auth/entity/user";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async createUser(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new HttpException("Email already registered", 400);
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    await this.userRepository.save({
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }
}
