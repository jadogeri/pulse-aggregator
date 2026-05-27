import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { MONITORED_SERVICES } from '../config/service.config';

@Controller('api/health')
export class HealthController {
  // Initialize the native NestJS Logger with a context name
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private healthCheckService: HealthCheckService,
    private httpIndicator: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async checkAllWebServices() {
    const checksToExecute = MONITORED_SERVICES.map((service) => {
      return () =>
        this.httpIndicator.pingCheck(service.name, service.url, {
          timeout: 3000,
        });
    });

    try {
      // Execute all pings concurrently
      const result = await this.healthCheckService.check(checksToExecute);
      
      this.logger.log('🚀 All downstream web services are completely healthy.');
      return result;
    } catch (error: unknown) {
      // Extract the failed service details from the Terminus error payload
      const brokenServices = (error as any).response?.errors ? Object.keys((error as any).response.errors) : ['Unknown Service'];
      
      this.logger.error(
        `🚨 CRITICAL: Health check failed! Down downstream systems: [${brokenServices.join(', ')}].`,
        (error as any).stack
      );

      // Explicitly print the detailed response block for Render to display
      this.logger.error(`Failure Details: ${JSON.stringify((error as any).response?.errors || (error as any).message)}`);

      // Rethrow so your Uptime monitor receives the correct 503 error code
      throw new ServiceUnavailableException((error as any).response);
    }
  }
}
