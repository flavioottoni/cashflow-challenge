import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    const method = req.method;
    const route = req.route?.path || req.url;

    return next.handle().pipe(
      tap({
        next: () => this.record(method, route, 200, start),
        error: (err) => {
          const status = err.status || 500;
          this.record(method, route, status, start);
        },
      }),
    );
  }

  private record(method: string, route: string, status: number, start: number) {
    const duration = (Date.now() - start) / 1000;
    this.metrics.httpRequestsTotal.inc({
      method,
      route,
      status: String(status),
    });
    this.metrics.httpRequestDuration.observe(
      { method, route, status: String(status) },
      duration,
    );
  }
}
