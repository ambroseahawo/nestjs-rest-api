import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class RefreshToken1740144086555 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if refresh_token table exists
    let refreshTokenTable = await queryRunner.getTable("refresh_token");
    if (!refreshTokenTable) {
      await queryRunner.createTable(
        new Table({
          name: "refresh_token",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "uuid",
            },
            {
              name: "token",
              type: "varchar",
              isUnique: true,
              isNullable: false,
            },
            {
              name: "createdAt",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "expiresAt",
              type: "timestamp",
              isNullable: false,
            },
          ],
        }),
      );

      // Fetch the table again after creation
      refreshTokenTable = await queryRunner.getTable("refresh_token");
    }

    // Ensure userId column exists
    if (!refreshTokenTable!.columns.find((col) => col.name === "userId")) {
      await queryRunner.addColumn(
        "refresh_token",
        new TableColumn({
          name: "userId",
          type: "uuid",
          isNullable: false,
        }),
      );
    }

    // Ensure foreign key exists
    refreshTokenTable = await queryRunner.getTable("refresh_token"); // Fetch updated table
    if (!refreshTokenTable!.foreignKeys.some((fk) => fk.columnNames.includes("userId"))) {
      await queryRunner.createForeignKey(
        "refresh_token",
        new TableForeignKey({
          columnNames: ["userId"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onDelete: "CASCADE",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const refreshTokenTable = await queryRunner.getTable("refresh_token");

    if (refreshTokenTable) {
      const foreignKey = refreshTokenTable.foreignKeys.find((fk) => fk.columnNames.includes("userId"));
      if (foreignKey) {
        await queryRunner.dropForeignKey("refresh_token", foreignKey);
      }

      await queryRunner.dropTable("refresh_token");
    }
  }
}
