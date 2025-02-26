import { SetMetadata } from "@nestjs/common";

export type MultiOwnershipRule = {
  entity: any; // Entity class
  paramKey: string; // URL param name that contains the entity ID
  ownerField: string; // Field that links to the parent entity
  relations?: string[]; // Relations to be loaded
};

export const OWNERSHIP_KEY = "ownership";
export const Ownership = (entity: any, userField: string) =>
  SetMetadata(OWNERSHIP_KEY, { entity, userField });

export const MULTI_OWNERSHIP_KEY = "ownershipRules";
export const OwnershipCheck = (...rules: MultiOwnershipRule[]) =>
  SetMetadata(MULTI_OWNERSHIP_KEY, rules);
