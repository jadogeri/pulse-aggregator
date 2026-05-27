import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { MONITORED_SERVICES } from '../config/service.config';

@Controller('api/health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private httpIndicator: HttpHealthIndicator,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @HealthCheck()
  async checkAllWebServices() {
    // Dynamically build individual check functions for Terminus engine
    const checksToExecute = MONITORED_SERVICES.map((service) => {
      return () =>
        this.httpIndicator.pingCheck(service.name, service.url, {
          timeout: service.timeout || 3000, // custom timeout fallback
        });
    });

    // Executes all checks concurrently. Returns 200 if all pass, 503 if any fail.
    return this.healthCheckService.check(checksToExecute);
  }
}
