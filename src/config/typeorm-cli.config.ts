import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";

import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { InitialSchema1739253188790 } from "@src/migrations/1739253188790-initial-schema";

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
  entities: [Recipe, Ingredient],
  migrations: [InitialSchema1739253188790],
});
