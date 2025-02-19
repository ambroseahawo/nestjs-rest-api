import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "@modules/auth/entity/user";
import { RecipeDto } from "@modules/recipe/dto/recipe.dto";
import { Recipe } from "@modules/recipe/entity/recipe";

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe) private recipeRepository: Repository<Recipe>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getRecipes(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

  async createRecipe(recipe: RecipeDto, userEmail: string): Promise<void> {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { email: userEmail } });
      await this.recipeRepository.save({ ...recipe, user });
    } catch (error) {
      throw new HttpException("Bad Request", 400);
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new HttpException("No entity found", HttpStatus.NOT_FOUND);
    }
    return recipe;
  }

  async updateDescription(id: string, description: string, userEmail: string): Promise<void> {
    try {
      const recipe = await this.recipeRepository.findOneOrFail({
        where: { id },
        relations: ["user"],
      });

      if (recipe.user.email !== userEmail) {
        throw new HttpException("You cannot update recipe. It's  not yours!", 400);
      }

      await this.recipeRepository.update({ id }, { description });
    } catch (error) {
      throw new HttpException("Bad Request", 400);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.recipeRepository.delete({ id });
  }
}
