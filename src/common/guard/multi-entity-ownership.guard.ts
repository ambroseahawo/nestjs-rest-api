import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource, Repository } from "typeorm";

import { MULTI_OWNERSHIP_KEY, MultiOwnershipRule } from "@/src/modules/auth/decorators/ownership";

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException("Unauthorized!");

    const ownershipConfig: MultiOwnershipRule[] = this.reflector.get<MultiOwnershipRule[]>(
      MULTI_OWNERSHIP_KEY,
      context.getHandler(),
    );

    if (!ownershipConfig || ownershipConfig.length === 0) return true; // No rules, allow access

    let currentEntity: any = null;

    for (const rule of ownershipConfig) {
      const repo: Repository<any> = this.dataSource.getRepository(rule.entity);
      const entityId = request.params[rule.paramKey];

      if (!entityId) throw new NotFoundException(`${rule.entity.name} ID missing in request`);

      const entity = await repo.findOne({
        where: { id: entityId },
        relations: rule.relations,
      });

      if (!entity) throw new NotFoundException(`${rule.entity.name} not found`);

      if (!currentEntity) {
        if (entity[rule.ownerField]?.id !== user.sub) {
          throw new ForbiddenException(`You do not own this ${rule.entity.name}`);
        }
      } else {
        if (entity[rule.ownerField]?.id !== currentEntity.id) {
          throw new ForbiddenException(
            `${rule.entity.name} does not belong to ${currentEntity.constructor.name}`,
          );
        }
      }

      currentEntity = entity;
    }

    return true;
  }
}
