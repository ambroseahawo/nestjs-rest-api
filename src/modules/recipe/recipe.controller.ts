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

import { Ownership } from "@modules/auth/decorators/ownership";
import { Role } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";
import { AccessTokenGuard } from "@modules/auth/guard/access-token.guard";
import { OwnershipGuard } from "@modules/auth/guard/authorization.guard";
import { RecipeDto, UpdateDescriptionDto } from "@modules/recipe/dto/recipe.dto";
import { Recipe } from "@modules/recipe/entity/recipe";
import { RecipeService } from "@modules/recipe/recipe.service";

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
