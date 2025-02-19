import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLE_KEY } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<UserRole>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRole) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return user.role === requiredRole;
  }
}
