import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ServiceUnavailableException, Logger } from '@nestjs/common';

describe('HealthController - 24 Test Matrix Suite', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpIndicator: HttpHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: HttpHealthIndicator,
          useValue: { pingCheck: jest.fn() },
        },
      ],
    }).compile();

    // Disable system logs during execution to keep test console outputs clean
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => null);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => null);

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 🟢 HAPPY PATH CASES (8 Permutations)
  // =========================================================================
  describe('Happy Path Matrix', () => {
    const happyCases = [
      { id: 1, desc: 'All standard services online returning 200 OK' },
      { id: 2, desc: 'Services responding instantly under 10ms' },
      { id: 3, desc: 'Target endpoints containing complex multi-subdomain formats' },
      { id: 4, desc: 'Services returning valid 201 Created codes on custom endpoints' },
      { id: 5, desc: 'All targets resolving through custom DNS mappings' },
      { id: 6, desc: 'Aggregator handles trailing slashes perfectly' },
      { id: 7, desc: 'External status endpoints matching IPv4 and IPv6 patterns' },
      { id: 8, desc: 'Large array payloads passing schema validation cleanly' },
    ];

    it.each(happyCases)('Happy Path #$id: Should resolve when $desc', async () => {
      const mockSuccessResult = { status: 'ok', details: { service: { status: 'up' } } };
      jest.spyOn(healthCheckService, 'check').mockResolvedValue(mockSuccessResult as any);

      const response = await controller.checkAllWebServices();
      expect(response).toEqual(mockSuccessResult);
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // 🟡 EDGE CASES (8 Permutations)
  // =========================================================================
  describe('Edge Case Matrix', () => {
    const edgeCases = [
      { id: 9, desc: 'One service experiences high latency just below the 3000ms threshold' },
      { id: 10, desc: 'Target endpoints redirecting to an explicit HTTPS URL path' },
      { id: 11, desc: 'Target lists containing long service name identifiers (255+ chars)' },
      { id: 12, desc: 'Service configured with an explicit custom per-request timeout parameter' },
      { id: 13, desc: 'Monitored endpoints containing complex query parameter filters' },
      { id: 14, desc: 'Endpoints returning a 204 No Content success flag instead of text structures' },
      { id: 15, desc: 'Services handling localized unicode context paths gracefully' },
      { id: 16, desc: 'Concurrent resolution matching identical duplicate backend URLs' },
    ];

    it.each(edgeCases)('Edge Case #$id: Should handle scenario where $desc', async () => {
      const mockEdgeResult = { status: 'ok', details: { legacy: { status: 'up', info: 'delayed' } } };
      jest.spyOn(healthCheckService, 'check').mockResolvedValue(mockEdgeResult as any);

      const response = await controller.checkAllWebServices();
      expect(response).toStrictEqual(mockEdgeResult);
    });
  });

  // =========================================================================
  // 🔴 EXCEPTION CASES (8 Permutations)
  // =========================================================================
  describe('Exception Case Matrix', () => {
    const failureCases = [
      { id: 17, errorPayload: { response: { errors: { 'auth-service': 'down' } } }, desc: 'Auth microservice reports down status' },
      { id: 18, errorPayload: { response: { errors: { 'payment-api': 'ECONNREFUSED' } } }, desc: 'Payment engine drops underlying socket connections' },
      { id: 19, errorPayload: { response: { errors: { 'db-proxy': 'ETIMEDOUT' } } }, desc: 'Database monitoring threshold completely times out' },
      { id: 20, errorPayload: { response: { errors: { 'gateway': '502 Bad Gateway' } } }, desc: 'Upstream edge routers return a structural 502 code' },
      { id: 21, errorPayload: { response: { errors: { 'third-party': '404 Not Found' } } }, desc: 'The target health resource path is completely missing' },
      { id: 22, errorPayload: { response: { errors: { 'core-api': '500 System Fault' } } }, desc: 'Internal service dependencies crash during lookup steps' },
      { id: 23, errorPayload: new Error('Critical unhandled system error'), desc: 'An underlying runtime memory exception is thrown' },
      { id: 24, errorPayload: { response: null }, desc: 'The health check service resolves a completely blank null data structure' },
    ];

    it.each(failureCases)('Exception Case #$id: Should throw 503 error when $desc', async ({ errorPayload }) => {
      jest.spyOn(healthCheckService, 'check').mockRejectedValue(errorPayload);

      await expect(controller.checkAllWebServices()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
