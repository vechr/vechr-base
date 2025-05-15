import { Injectable } from '@nestjs/common';
import { HealthService } from '@/frameworks/health/health.service';
import { ErrorResponse, log, SuccessResponse } from '@/frameworks';

interface IHealthResponse {
  data: {
    status: string;
    health?: any;
  };
}

@Injectable()
export class SystemMonitorHandler {
  constructor(private readonly healthService: HealthService) {}

  public async health() {
    try {
      const healthStatus = await this.healthService.healthCheck();

      const response = new SuccessResponse<IHealthResponse['data']>(
        'Health check completed successfully',
        {
          status: 'ok',
          health: healthStatus,
        },
      );

      log.info('Health check command response', { response });
      return response;
    } catch (err: any) {
      const errorResponse = new ErrorResponse(
        'Failed to perform health check',
        err,
      );
      log.error('Health check command error', { error: err });
      return errorResponse;
    }
  }
}
