import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { RecipeService } from "@modules/recipe/recipe.service";
import { RecipeDto, UpdateDescriptionDto } from "./dto/recipe.dto";

@Controller("recipe")
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @Get()
  async getRecipes() {
    return await this.recipeService.getRecipes();
  }

  @Post()
  async createRecipe(@Body() recipeDto: RecipeDto) {
    return await this.recipeService.createRecipe(recipeDto);
  }

  @Get("/:id")
  async getRecipe(@Param("id") id: string) {
    return await this.recipeService.getRecipe(id);
  }

  @Patch("/:id")
  async updateDescription(@Body() { description }: UpdateDescriptionDto, @Param("id") id: string) {
    return await this.recipeService.updateDescription(id, description);
  }

  @Delete("/:id")
  async deleteRecipe(@Param("id") id: string) {
    return await this.recipeService.deleteRecipe(id);
  }
}
