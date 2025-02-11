require("module-alias/register");

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "@src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT as string);
}
bootstrap().catch((err) => {
  console.log("Error during app bootstrap: ", err);
  process.exit(1);
});
