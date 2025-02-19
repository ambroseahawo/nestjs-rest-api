import { SetMetadata } from "@nestjs/common";

import { UserRole } from "@modules/auth/entity/user";

export const ROLE_KEY = "roles";
export const Role = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);
