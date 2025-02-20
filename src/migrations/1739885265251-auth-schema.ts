import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

import { UserRole } from "@modules/auth/entity/user";

export class AuthSchema1739885265251 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUserTable = await queryRunner.hasTable("user");
    if (!hasUserTable) {
      await queryRunner.createTable(
        new Table({
          name: "user",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
              isNullable: false,
            },
            {
              name: "email",
              type: "varchar",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "password",
              type: "varchar",
              isNullable: false,
            },
            {
              name: "userRole",
              type: "enum",
              isNullable: false,
              enum: [...Object.values(UserRole)],
              default: UserRole.USER,
            },
            {
              name: "createdAt",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "updatedAt",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
              onUpdate: "CURRENT_TIMESTAMP",
            },
          ],
        }),
      );
    }

    const hasRecipeTable = await queryRunner.hasTable("recipe");
    if (hasRecipeTable) {
      const recipeTable = await queryRunner.getTable("recipe");
      if (recipeTable && !recipeTable.columns.find((col) => col.name === "userId")) {
        await queryRunner.addColumn(
          "recipe",
          new TableColumn({
            name: "userId",
            type: "uuid",
            isNullable: false,
          }),
        );
      }

      const foreignKeys = recipeTable?.foreignKeys || [];
      if (!foreignKeys.find((fk) => fk.columnNames.includes("userId"))) {
        await queryRunner.createForeignKey(
          "recipe",
          new TableForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "RESTRICT",
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasRecipeTable = await queryRunner.hasTable("recipe");
    if (hasRecipeTable) {
      const table = await queryRunner.getTable("recipe");
      if (table) {
        const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes("userId"));
        if (foreignKey) {
          await queryRunner.dropForeignKey("recipe", foreignKey);
        }

        if (table.columns.find((col) => col.name === "userId")) {
          await queryRunner.dropColumn("recipe", "userId");
        }
      }
    }

    const hasUserTable = await queryRunner.hasTable("user");
    if (hasUserTable) {
      await queryRunner.dropTable("user");
    }
  }
}
