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

import { Role } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";
import { AccessTokenGuard } from "@modules/auth/guard/access-token.guard";
import { RoleGuard } from "@modules/auth/guard/authorization.guard";
import { RecipeService } from "@modules/recipe/recipe.service";
import { RecipeDto, UpdateDescriptionDto } from "./dto/recipe.dto";

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
    const { sub } = req.user;
    return await this.recipeService.createRecipe(recipeDto, sub);
  }

  @Get("/:id")
  async getRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.getRecipe(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch("/:id")
  async updateDescription(
    @Body() { description }: UpdateDescriptionDto,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() req,
  ) {
    const { sub } = req.user;
    return await this.recipeService.updateDescription(id, description, sub);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete("/:id")
  async deleteRecipe(@Param("id", new ParseUUIDPipe()) id: string) {
    return await this.recipeService.deleteRecipe(id);
  }
}
