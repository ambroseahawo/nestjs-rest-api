import { Module } from "@nestjs/common";

import { RecipeController } from "@modules/recipe/recipe.controller";
import { RecipeService } from "@modules/recipe/recipe.service";

@Module({
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}
