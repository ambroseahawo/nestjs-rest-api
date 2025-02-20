import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ type: "varchar", default: UserRole.USER, name: "userRole" })
  role: UserRole;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;
}
