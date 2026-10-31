import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Récupère l'utilisateur connecté depuis la requête HTTP (injecté par JwtStrategy)
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
