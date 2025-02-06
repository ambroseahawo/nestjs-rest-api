import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { v4 } from "uuid";

import { RecipeDto } from "@modules/recipe/dto/recipe.dto";
import { Recipe } from "@modules/recipe/entity/recipe";

@Injectable()
export class RecipeService {
  private _recipes: Recipe[] = [];

  async getRecipes(): Promise<Recipe[]> {
    return this._recipes;
  }

  async createRecipe(recipe: RecipeDto): Promise<void> {
    const recipeEntity = { ...recipe, id: v4() };
    this._recipes.push(recipeEntity);
  }

  async getRecipe(id: string): Promise<Recipe> {
    const recipe = this._recipes.find((r) => r.id === id);
    if (!recipe) {
      throw new HttpException("NotFound", HttpStatus.NOT_FOUND);
    }
    return recipe;
  }

  async updateDescription(id: string, description: string): Promise<void> {
    const recipeIndex = this._recipes.findIndex((r) => r.id === id);
    console.log(`recipeIndex => ${recipeIndex}`);
    if (recipeIndex < 0) {
      throw new HttpException("NotFound", HttpStatus.NOT_FOUND);
    }
    this._recipes[recipeIndex] = { ...this._recipes[recipeIndex], description };
  }

  async deleteRecipe(id: string): Promise<void> {
    this._recipes = this._recipes.filter((r) => r.id !== id);
  }
}
