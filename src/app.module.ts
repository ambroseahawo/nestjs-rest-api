import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

import { validate } from "@config/env.validation";

import { AuthModule } from "@modules/auth/auth.module";
import { RefreshToken } from "@modules/auth/entity/refreshToken";
import { User } from "@modules/auth/entity/user";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { RecipeModule } from "@modules/recipe/recipe.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        entities: [Recipe, Ingredient, User, RefreshToken],
        synchronize: configService.get<boolean>("DB_SYNCHRONIZATION"),
        logging: configService.get<boolean>("DB_LOGGING"),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RecipeModule,
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: Number(configService.getOrThrow("UPLOAD_RATE_TTL")),
            limit: Number(configService.getOrThrow("UPLOAD_RATE_LIMIT")),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
