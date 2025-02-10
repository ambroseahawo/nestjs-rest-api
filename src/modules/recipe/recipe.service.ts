import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { RecipeDto } from "@modules/recipe/dto/recipe.dto";
import { Recipe } from "@modules/recipe/entity/recipe";
import { Repository } from "typeorm";

@Injectable()
export class RecipeService {
  constructor(@InjectRepository(Recipe) private recipeRepository: Repository<Recipe>) {}

  async getRecipes(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

  async createRecipe(recipe: RecipeDto): Promise<void> {
    await this.recipeRepository.save({ ...recipe });
  }

  async getRecipe(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new HttpException("No entity found", HttpStatus.NOT_FOUND);
    }
    return recipe;
  }

  async updateDescription(id: string, description: string): Promise<void> {
    await this.recipeRepository.update({ id }, { description });
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.recipeRepository.delete({ id });
  }
}
