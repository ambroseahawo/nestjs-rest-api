import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "@modules/auth/entity/user";
import { Unit } from "@modules/recipe/dto/recipe.dto";

@Entity({ name: "recipe" })
export class Recipe {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  description: string;

  @Column({ type: "uuid" })
  userId: string;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, {
    cascade: true,
    eager: true,
  })
  ingredients: Ingredient[];

  @ManyToOne(() => User, (user) => user.recipes, { onDelete: "CASCADE" })
  user: User;
}

@Entity({ name: "ingredient" })
export class Ingredient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "varchar" })
  unit: Unit;

  @Column({ type: "integer" })
  quantity: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, { onDelete: "CASCADE" })
  recipe: Recipe;
}
