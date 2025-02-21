import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, QueryRunner, Repository } from "typeorm";

import { User } from "@modules/auth/entity/user";
import { IngredientDto, RecipeDto } from "@modules/recipe/dto/recipe.dto";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe) private recipeRepository: Repository<Recipe>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async getRecipes(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

  async getRecipe(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new HttpException("No entity found", HttpStatus.NOT_FOUND);
    }
    return recipe;
  }

  // async createRecipe(recipe: RecipeDto, userEmail: string): Promise<void> {
  //   try {
  //     const user = await this.userRepository.findOneOrFail({ where: { email: userEmail } });
  //     console.log(`user =>${JSON.stringify(user)}`);
  //     await this.recipeRepository.save({ ...recipe, user });
  //   } catch (error) {
  //     throw new HttpException("Bad Request", 400);
  //   }
  // }

  async createRecipe(recipeDto: RecipeDto, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneOrFail(User, {
        where: { id: userId },
      });

      const newRecipe = queryRunner.manager.create(Recipe, { ...recipeDto, user });
      await queryRunner.manager.save(newRecipe);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async updateRecipeDescription(id: string, description: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const recipe = await queryRunner.manager.findOneOrFail(Recipe, {
      //   where: { id },
      //   relations: ["user"],
      // });

      // const authenticatedUser = await queryRunner.manager.findOneOrFail(User, {
      //   where: { email: userEmail },
      // });

      // // either the owner or an admin to update
      // if (recipe.user.email !== userEmail && authenticatedUser.role !== UserRole.ADMIN) {
      //   throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      // }

      await queryRunner.manager.update(Recipe, id, { description });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  // async updateRecipeDescription(id: string, description: string, userEmail: string): Promise<void> {
  //   try {
  //     const recipe = await this.recipeRepository.findOneOrFail({
  //       where: { id },
  //       relations: ["user"],
  //     });

  //     if (recipe.user.email !== userEmail) {
  //       throw new HttpException("You cannot update recipe. It's  not yours!", 400);
  //     }

  //     await this.recipeRepository.update({ id }, { description });
  //   } catch (error) {
  //     throw new HttpException("Bad Request", 400);
  //   }
  // }

  // async deleteRecipe(id: string): Promise<void> {
  //   await this.recipeRepository.delete({ id });
  // }

  async upsertRecipe(id: string, recipeDto: RecipeDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.updateRecipeDetails(queryRunner, id, recipeDto);
      await this.manageIngredients(queryRunner, id, recipeDto.ingredients);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  private async updateRecipeDetails(
    queryRunner: QueryRunner,
    recipeId: string,
    recipeDto: Partial<RecipeDto>,
  ): Promise<void> {
    // Extract only the 'description' field and ensure it's valid
    const updateData: Partial<RecipeDto> = {};

    if (recipeDto.description && recipeDto.description.trim() !== "") {
      updateData.description = recipeDto.description.trim();
    }

    // Proceed only if there is valid data to update
    if (Object.keys(updateData).length > 0) {
      await queryRunner.manager.update(Recipe, recipeId, updateData);
    }
  }

  private async manageIngredients(
    queryRunner: QueryRunner,
    recipeId: string,
    ingredients: IngredientDto[],
  ): Promise<void> {
    if (!ingredients || ingredients.length === 0) return;

    const existingIngredients = await queryRunner.manager.find(Ingredient, {
      where: { recipe: { id: recipeId } },
    });

    const ingredientMap = new Map(existingIngredients.map((i) => [i.id, i]));

    for (const ingredient of ingredients) {
      if (ingredient.id && ingredientMap.has(ingredient.id)) {
        // Update existing ingredient
        await queryRunner.manager.update(Ingredient, ingredient.id, ingredient);
        ingredientMap.delete(ingredient.id);
      } else {
        // Insert new ingredient
        const newIngredient = queryRunner.manager.create(Ingredient, {
          ...ingredient,
          recipe: { id: recipeId },
        });
        await queryRunner.manager.save(newIngredient);
      }
    }

    // Remove ingredients that are no longer present
    for (const ingredient of ingredientMap.values()) {
      await queryRunner.manager.delete(Ingredient, ingredient.id);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const recipe = await queryRunner.manager.findOneOrFail(Recipe, {
        where: { id },
        relations: ["user"],
      });
      await queryRunner.manager.remove(Recipe, recipe);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}
