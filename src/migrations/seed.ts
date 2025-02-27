import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";

import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

import { RefreshToken } from "@modules/auth/entity/refreshToken";
import { User } from "@modules/auth/entity/user";
import { Unit } from "@modules/recipe/dto/recipe.dto";
import { Ingredient, Recipe } from "@modules/recipe/entity/recipe";

const configService = new ConfigService();

const dataSource = new DataSource({
  type: "postgres",
  host: configService.get<string>("DB_HOST"),
  port: configService.get<number>("DB_PORT"),
  username: configService.get<string>("DB_USERNAME"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_NAME"),
  entities: [User, Recipe, RefreshToken, Ingredient],
  synchronize: configService.get<string>("NODE_ENV") !== "production",
  logging: configService.get<boolean>("DB_LOGGING"),
});

async function seed() {
  await dataSource.initialize();
  console.log("Connected to database. Seeding data...");

  const userRepo = dataSource.getRepository(User);
  const recipeRepo = dataSource.getRepository(Recipe);
  const ingredientRepo = dataSource.getRepository(Ingredient);

  // Clear previous data
  await ingredientRepo.delete({});
  await recipeRepo.delete({});
  await userRepo.delete({});

  for (let i = 0; i < 50; i++) {
    const hashedPassword = await hash(faker.internet.password(), 10); // Hash the password

    const user = await userRepo.save(
      userRepo.create({
        email: faker.internet.email(),
        password: hashedPassword, // Store hashed password
      }),
    );

    const recipeCount = faker.number.int({ min: 2, max: 10 });

    for (let j = 0; j < recipeCount; j++) {
      const recipe = await recipeRepo.save(
        recipeRepo.create({
          description: faker.lorem.sentence({ min: 10, max: 20 }),
          user,
        }),
      );

      const ingredientCount = faker.number.int({ min: 2, max: 10 });

      for (let k = 0; k < ingredientCount; k++) {
        await ingredientRepo.save(
          ingredientRepo.create({
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 10 }),
            unit: faker.helpers.arrayElement(Object.values(Unit)) as Unit,
            recipe,
          }),
        );
      }
    }
  }

  console.log("Seeding complete!");
  await dataSource.destroy();
}

// Run the seed script
seed().catch((error) => {
  console.error("Seeding failed:", error);
  dataSource.destroy();
});
