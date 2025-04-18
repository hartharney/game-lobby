import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Log the incoming request details
    this.logger.log(`Incoming request: ${request.method} ${request.url}`);
    this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);
    this.logger.log(`Body: ${JSON.stringify(request.body)}`);

    return next.handle();
  }
}
