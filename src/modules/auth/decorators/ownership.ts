import { SetMetadata } from "@nestjs/common";

export const OWNERSHIP_KEY = "ownership";
export const Ownership = (entity: any, userField: string) =>
  SetMetadata(OWNERSHIP_KEY, { entity, userField });
