import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddImageToRecipe1740226144936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const recipeTable = await queryRunner.getTable("recipe");
    if (recipeTable && !recipeTable.columns.find((col) => col.name === "image")) {
      await queryRunner.addColumn(
        "recipe",
        new TableColumn({
          name: "image",
          type: "varchar",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("recipe");
    if (table && table.columns.find((col) => col.name === "image")) {
      await queryRunner.dropColumn("recipe", "image");
    }
  }
}
