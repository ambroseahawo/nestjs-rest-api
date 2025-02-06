export class RecipeDto {
  description: string;
  ingredients: IngredientDto[];
}

export class IngredientDto {
  name: string;
  unit: Unit;
  quantity: number;
}

export class UpdateDescriptionDto {
  description: string;
}

export enum Unit {
  MILLILITERS = "milliliters",
  LITERS = "LITERS",
  GRAMS = "grams",
  KILOGRAMS = "kilograms",
  SPOONS = "spoons",
  CUPS = "cups",
  PIECES = "pieces",
}
