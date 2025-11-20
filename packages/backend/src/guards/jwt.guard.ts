import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) throw new UnauthorizedException();
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') throw new UnauthorizedException();
    try {
      const token = parts[1];
      const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = { id: payload.sub };
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
