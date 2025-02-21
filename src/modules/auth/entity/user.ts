import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { RefreshToken } from "@modules/auth/entity/refreshToken";
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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  // @DeleteDateColumn({ nullable: true, select: false })
  // deletedAt?: Date;
}
