import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Recipe } from "@modules/recipe/entity/recipe";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
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
