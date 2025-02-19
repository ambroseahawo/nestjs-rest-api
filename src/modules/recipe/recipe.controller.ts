import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";

import { Ownership } from "@modules/auth/decorators/ownership";
import { Role } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";
import { AccessTokenGuard } from "@modules/auth/guard/access-token.guard";
import { OwnershipGuard, RoleGuard } from "@modules/auth/guard/authorization.guard";
import { RecipeService } from "@modules/recipe/recipe.service";
import { RecipeDto, UpdateDescriptionDto } from "./dto/recipe.dto";
import { Recipe } from "./entity/recipe";

@Controller("recipe")
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @Get()
  async getRecipes() {
    return await this.recipeService.getRecipes();
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  async createRecipe(@Body() recipeDto: RecipeDto, @Request() req) {
    console.log(`req-user ${JSON.stringify(req.user)}`);
    const { sub } = req.user;
    return await this.recipeService.createRecipe(recipeDto, sub);
  }

  @Get("/:id")
  async getRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.getRecipe(id);
  }

  @Role(UserRole.ADMIN)
  @Ownership(Recipe, "user")
  @UseGuards(AccessTokenGuard, OwnershipGuard)
  @Patch("/update-description/:id")
  async updateRecipeDescription(
    @Body() { description }: UpdateDescriptionDto,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() req,
  ) {
    const { sub } = req.user;
    return await this.recipeService.updateRecipeDescription(id, description, sub);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete("/:id")
  async deleteRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.deleteRecipe(id);
  }
}
