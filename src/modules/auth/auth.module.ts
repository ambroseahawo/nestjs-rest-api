import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";
import { User } from "@modules/auth/entity/user";
import { AccessTokenStrategy } from "@modules/auth/passport-strategy/access-token.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.register({})],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
})
export class AuthModule {}
