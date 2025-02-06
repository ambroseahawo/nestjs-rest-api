import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RecipeModule } from "@modules/recipe/recipe.module";

@Module({
  imports: [
    RecipeModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [],
      synchronize: true, // don't include on production
      logging: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
