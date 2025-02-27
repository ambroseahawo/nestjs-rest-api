import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";

import { AccessTokenGuard } from "@/src/common/guard/access-token.guard";
import { OwnershipGuard } from "@/src/common/guard/authorization.guard";
import { OwnershipGuard as MultiEntityOwnership } from "@/src/common/guard/multi-entity-ownership.guard";
import { Ownership, OwnershipCheck } from "@modules/auth/decorators/ownership";
import { Role } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";
import { IngredientDto, RecipeDto, UpdateDescriptionDto } from "@modules/recipe/dto/recipe.dto";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";
import { RecipeService } from "@modules/recipe/recipe.service";

@Controller("recipe")
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  // get recipe related to user
  @UseGuards(AccessTokenGuard)
  @Get()
  async getRecipes(@Request() req) {
    const { sub } = req.user;
    return await this.recipeService.getRecipes(sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  async createRecipe(@Body() recipeDto: RecipeDto, @Request() req) {
    const { sub } = req.user;
    return await this.recipeService.createRecipe(recipeDto, sub);
  }

  @Get("/:id")
  async getRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.getRecipe(id);
  }

  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Post("/:id/ingredients")
  async addIngredient(
    @Body() ingredientDto: IngredientDto,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return await this.recipeService.addIngredient(id, ingredientDto);
  }

  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Get("/:id/ingredients")
  async getIngredients(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.getIngredients(id);
  }

  @Role(UserRole.ADMIN)
  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Patch("/update-description/:id")
  async updateRecipeDescription(
    @Body() { description }: UpdateDescriptionDto,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    return await this.recipeService.updateRecipeDescription(id, description);
  }

  @OwnershipCheck(
    { entity: Recipe, paramKey: "recipeId", ownerField: "user", relations: ["user"] },
    { entity: Ingredient, paramKey: "ingredientId", ownerField: "recipe", relations: ["recipe"] },
  )
  @UseGuards(AccessTokenGuard, MultiEntityOwnership)
  @Patch("/:recipeId/ingredients/:ingredientId")
  async updateIngredient(
    @Body() ingredientDto: Partial<IngredientDto>,
    @Param("recipeId") recipeId: string,
    @Param("ingredientId") ingredientId: string,
  ) {
    return await this.recipeService.updateIngredient(recipeId, ingredientId, ingredientDto);
  }

  // delete ingredient
  @UseGuards(AccessTokenGuard)
  @Delete("/:recipeId/ingredients/:ingredientId")
  async deleteIngredient(
    @Param("recipeId") recipeId: string,
    @Param("ingredientId") ingredientId: string,
    @Request() req,
  ) {
    const { sub } = req.user;
    return await this.recipeService.deleteIngredient(recipeId, ingredientId, sub);
  }

  @Role(UserRole.ADMIN)
  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Patch("/:id")
  async upsertRecipe(@Body() recipeDto: RecipeDto, @Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.upsertRecipe(id, recipeDto);
  }

  @Role(UserRole.ADMIN)
  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Delete("/:id")
  async deleteRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.deleteRecipe(id);
  }

  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @UseInterceptors(FileInterceptor("file"))
  @Throttle({ default: { limit: 1, ttl: 6000 } }) // Override default configuration for Rate limiting and duration(ms).
  @Post("/:id/upload-file")
  async addImageToRecipe(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2mb
          // new CustomFileTypeValidator(["image/jpeg", "image/jpg", "image/png"]), // custom validator
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }), // regex
        ],
      }),
    )
    file: Express.Multer.File,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    await this.recipeService.addFileToRecipe(file, id);
  }
}
