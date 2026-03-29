import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '@/modules/users/current-user.type';

export const CurrentUserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
    return request.user;
  },
);