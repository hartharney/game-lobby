import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class UptimeService implements OnModuleInit {
  private readonly logger = new Logger(UptimeService.name);

  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    // Start pinging every minute (60000 ms)
    interval(60000)
      .pipe(
        switchMap(() =>
          this.httpService.get(`${process.env.API_HOST}/api/v1/health`),
        ),
      )
      .subscribe({
        next: (response) => {
          this.logger.log(
            `✅ Health check successful: ${response?.data?.status}`,
          );
        },
        error: (error) => {
          this.logger.error('❌ Health check failed', error?.message);
        },
      });
  }
}
