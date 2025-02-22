import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "@modules/auth/entity/user";
import { Recipe } from "@modules/recipe/entity/recipe";
import { RecipeController } from "@modules/recipe/recipe.controller";
import { RecipeService } from "@modules/recipe/recipe.service";
import { AwsS3Module } from "@modules/s3/s3.module";

@Module({
  controllers: [RecipeController],
  providers: [RecipeService],
  imports: [TypeOrmModule.forFeature([Recipe, User]), AwsS3Module],
  exports: [TypeOrmModule],
})
export class RecipeModule {}
