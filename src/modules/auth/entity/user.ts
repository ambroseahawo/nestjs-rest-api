import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { Recipe } from "@modules/recipe/entity/recipe";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity({ name: "user" })
export class User {
  @PrimaryColumn()
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: "varchar", default: UserRole.USER, name: "userRole" })
  role: UserRole;

  @OneToMany(() => Recipe, (recipe) => recipe.user, {
    cascade: true,
    eager: true,
  })
  recipes: Recipe[];
}
