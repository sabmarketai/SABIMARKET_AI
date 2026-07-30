import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) =>
                JSON.parse(
                    JSON.stringify(data, (_, value) =>
                    // typeof value === 'bigint'
                    //   ? value.toString()
                    //   : value,
                    {
                        if (typeof value === 'bigint') {
                            return value.toString();
                        }

                        if (value instanceof Prisma.Decimal) {
                            return value.toNumber();
                        }

                        return value;
                    }
                    ),
                ),
            ),
        );
    }
}