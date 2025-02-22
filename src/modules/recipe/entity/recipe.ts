import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "@modules/auth/entity/user";
import { Unit } from "@modules/recipe/dto/recipe.dto";

@Entity({ name: "recipe" })
export class Recipe {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  image?: string;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, {
    cascade: ["insert"],
  })
  ingredients: Ingredient[];

  @ManyToOne(() => User, (user) => user.recipes, { onDelete: "RESTRICT" })
  user: User;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  // @DeleteDateColumn({ nullable: true, select: false })
  // deletedAt?: Date;
}

@Entity({ name: "ingredient" })
export class Ingredient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "enum", enum: Unit, nullable: false })
  unit: Unit;

  @Column({ type: "integer", unsigned: true, nullable: false })
  quantity: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, { onDelete: "RESTRICT" })
  recipe: Recipe;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  // @DeleteDateColumn({ nullable: true, select: false })
  // deletedAt?: Date;
}

// onDelete must be on the @ManyToOne side because:

// The foreign key is stored in the child table (Ingredient.recipeId).
// The parent (Recipe) does not reference individual children (Ingredient).
// Databases handle cascading deletes from the foreign key side.

// onDelete: "RESTRICT" is enforced at the database level to prevent deletion.
// onDelete: "CASCADE" ensures automatic cleanup of related data.
// Always specify onDelete on the @ManyToOne side, not @OneToMany.
