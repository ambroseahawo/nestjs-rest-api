import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "@modules/auth/entity/user";

@Entity({ name: "refresh_token" })
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  user: User;
}
