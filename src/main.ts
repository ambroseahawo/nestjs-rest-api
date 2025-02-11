require("module-alias/register");

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "@src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<string>("APP_PORT");
  await app.listen(port as string);
}
bootstrap().catch((err) => {
  console.log("Error during app bootstrap: ", err);
  process.exit(1);
});
