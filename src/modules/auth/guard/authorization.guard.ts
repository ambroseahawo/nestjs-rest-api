import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource, ObjectLiteral, Repository } from "typeorm";

import { OWNERSHIP_KEY } from "@modules/auth/decorators/ownership";
import { ROLE_KEY } from "@modules/auth/decorators/role";
import { UserRole } from "@modules/auth/entity/user";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return false; // No role restriction
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

@Injectable()
export class OwnershipGuard<T extends ObjectLiteral> {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { user } = request;
      const resourceId = request.params.id;

      if (!user || !resourceId) {
        throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      }

      // Get entity and ownership field from metadata
      const ownershipData = this.reflector.get<{ entity: any; userField: string }>(
        OWNERSHIP_KEY,
        context.getHandler(),
      );

      if (!ownershipData) {
        throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      }

      const { entity, userField } = ownershipData;
      const repository: Repository<T> = this.dataSource.getRepository(entity);

      // Fetch resource from DB
      const resource = await repository.findOne({
        where: { id: resourceId } as any,
        relations: [userField],
      });

      if (!resource) {
        throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
      }

      // Check ownership
      if (resource[userField]?.id === user.sub) {
        return true;
      }

      // Check role only if roles are explicitly defined
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && requiredRoles.length > 0) {
        return requiredRoles.includes(user.role);
      }

      // If no ownership and no explicit roles, deny access
      return false;
    } catch (error) {
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
    }
  }
}
