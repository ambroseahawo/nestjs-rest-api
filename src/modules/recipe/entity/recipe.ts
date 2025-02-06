import { Unit } from "@modules/recipe/dto/recipe.dto";

export class Recipe {
  id: string;
  description: string;
  ingredients: Ingredient[];
}

export class Ingredient {
  name: string;
  unit: Unit;
  quantity: number;
}
