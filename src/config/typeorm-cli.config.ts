import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

import { RefreshToken } from "@modules/auth/entity/refreshToken";
import { User } from "@modules/auth/entity/user";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { InitialSchema1739253188790 } from "@src/migrations/1739253188790-initial-schema";
import { AuthSchema1739885265251 } from "@src/migrations/1739885265251-auth-schema";
import { RefreshToken1740144086555 } from "@src/migrations/1740144086555-refresh-token";
import { AddImageToRecipe1740226144936 } from "@src/migrations/1740226144936-add-image-to-recipe";

config();

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get<string>("DB_HOST"),
  port: configService.get<number>("DB_PORT"),
  username: configService.get<string>("DB_USERNAME"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_NAME"),
  logging: configService.get<boolean>("DB_LOGGING"),
  entities: [Recipe, Ingredient, User, RefreshToken],
  migrations: [
    InitialSchema1739253188790,
    AuthSchema1739885265251,
    RefreshToken1740144086555,
    AddImageToRecipe1740226144936,
  ],
});
