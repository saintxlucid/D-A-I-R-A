import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private requiredRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('User not found in request')
    }

    if (!this.requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Role ${user.role} not permitted`)
    }

    return true
  }
}
