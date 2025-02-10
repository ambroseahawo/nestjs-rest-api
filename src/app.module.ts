import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import "dotenv/config";

import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { RecipeModule } from "@modules/recipe/recipe.module";

@Module({
  imports: [
    RecipeModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: process.env.POSTGRES_USERNAME as string,
      password: process.env.POSTGRES_PASSWORD as string,
      database: process.env.POSTGRES_DB as string,
      entities: [Recipe, Ingredient],
      synchronize: true, // don't include on production
      logging: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
