import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private JWKS = createRemoteJWKSet(
    new URL(
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    ),
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtAuthGuard running');

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
         console.log('Authorization:', authHeader);
      const { payload } = await jwtVerify(token, this.JWKS,  {
  issuer: `${process.env.SUPABASE_URL}/auth/v1`,
});

console.log('JWT Payload:', payload);

      const user: AuthUser = {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
      };

      request.user = user;

      return true;
    } catch (err){
      console.error(err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}