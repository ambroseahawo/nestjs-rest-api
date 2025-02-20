import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

import { Unit } from "@modules/recipe/dto/recipe.dto";

export class InitialSchema1739253188790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRecipeTable = await queryRunner.hasTable("recipe");
    if (!hasRecipeTable) {
      await queryRunner.createTable(
        new Table({
          name: "recipe",
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
              name: "description",
              type: "varchar",
              isNullable: false,
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

    const hasIngredientTable = await queryRunner.hasTable("ingredient");
    if (!hasIngredientTable) {
      await queryRunner.createTable(
        new Table({
          name: "ingredient",
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
              name: "name",
              type: "varchar",
              isNullable: false,
            },
            {
              name: "unit",
              type: "enum",
              isNullable: false,
              enum: [...Object.values(Unit)],
            },
            {
              name: "quantity",
              type: "integer",
              isNullable: false,
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

    const ingredientTable = await queryRunner.getTable("ingredient");
    if (ingredientTable && !ingredientTable.columns.find((col) => col.name === "recipeId")) {
      await queryRunner.addColumn(
        "ingredient",
        new TableColumn({
          name: "recipeId",
          type: "uuid",
        }),
      );
    }

    const foreignKeys = ingredientTable?.foreignKeys || [];
    if (!foreignKeys.find((fk) => fk.columnNames.includes("recipeId"))) {
      await queryRunner.createForeignKey(
        "ingredient",
        new TableForeignKey({
          columnNames: ["recipeId"],
          referencedColumnNames: ["id"],
          referencedTableName: "recipe",
          onDelete: "RESTRICT",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("ingredient");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes("recipeId"));
      if (foreignKey) {
        await queryRunner.dropForeignKey("ingredient", foreignKey);
      }

      if (table.columns.find((col) => col.name === "recipeId")) {
        await queryRunner.dropColumn("ingredient", "recipeId");
      }

      // await queryRunner.dropTable("ingredient");
    }

    const hasIngredientTable = await queryRunner.hasTable("ingredient");
    if (hasIngredientTable) {
      await queryRunner.dropTable("ingredient");
    }

    const hasRecipeTable = await queryRunner.hasTable("recipe");
    if (hasRecipeTable) {
      await queryRunner.dropTable("recipe");
    }

    // if (!table) return;

    // const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf("recipeId") !== -1);
    // if (foreignKey) {
    //   await queryRunner.dropForeignKey("ingredient", foreignKey);
    // }

    // const column = table.columns.find((col) => col.name === "recipeId");
    // if (column) {
    //   await queryRunner.dropColumn("ingredient", "recipeId");
    // }

    // await queryRunner.dropTable("ingredient");
    // await queryRunner.dropTable("recipe");
  }
}
