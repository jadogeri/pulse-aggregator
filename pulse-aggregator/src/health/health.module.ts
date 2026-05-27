import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000, // Global backup timeout for all outgoing requests
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
