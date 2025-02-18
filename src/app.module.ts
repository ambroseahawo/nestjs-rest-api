import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { validate } from "@config/env.validation";

import { AuthModule } from "@modules/auth/auth.module";
import { User } from "@modules/auth/entity/user";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { RecipeModule } from "@modules/recipe/recipe.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    RecipeModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        entities: [Recipe, Ingredient, User],
        synchronize: configService.get<boolean>("DB_SYNCHRONIZATION"),
        logging: configService.get<boolean>("DB_LOGGING"),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
