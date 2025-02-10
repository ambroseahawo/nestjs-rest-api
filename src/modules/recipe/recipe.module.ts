import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Recipe } from "@modules/recipe/entity/recipe";
import { RecipeController } from "@modules/recipe/recipe.controller";
import { RecipeService } from "@modules/recipe/recipe.service";

@Module({
  controllers: [RecipeController],
  providers: [RecipeService],
  imports: [TypeOrmModule.forFeature([Recipe])],
})
export class RecipeModule {}
